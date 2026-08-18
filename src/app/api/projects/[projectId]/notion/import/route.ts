import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/bus";
import {
  mapNotionStatusToKztek,
  mapNotionPriorityToKztek,
  type NotionTaskItem,
} from "@/lib/notion";

const importSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string(),
      status: z.string().optional(),
      priority: z.string().optional(),
      dueDate: z.string().optional(),
      assigneeName: z.string().optional(),
    })
  ),
  sprintId: z.string().nullable().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId } = await params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (!member) {
      return NextResponse.json({ error: "Không có quyền truy cập dự án này" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = importSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu import không hợp lệ" }, { status: 400 });
    }

    const { tasks, sprintId } = parsed.data;
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({ error: "Danh sách tasks rỗng" }, { status: 400 });
    }

    // Lấy số thứ tự task lớn nhất hiện tại
    const lastTask = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    let currentNumber = lastTask?.number ?? 0;

    // Lấy nhãn Notion hoặc tạo mới nếu chưa có
    let notionLabel = await prisma.label.findFirst({
      where: { projectId, name: "Notion" },
    });
    if (!notionLabel) {
      notionLabel = await prisma.label.create({
        data: {
          projectId,
          name: "Notion",
          color: "#000000",
        },
      });
    }

    const createdTasks = [];

    for (let i = 0; i < tasks.length; i++) {
      const item = tasks[i];
      currentNumber += 1;
      const status = mapNotionStatusToKztek(item.status);
      const priority = mapNotionPriorityToKztek(item.priority);

      const task = await prisma.task.create({
        data: {
          projectId,
          number: currentNumber,
          title: item.title,
          description: `Được đồng bộ từ Notion: [Xem trang gốc Notion](${item.url})`,
          type: "TASK",
          status,
          priority,
          storyPoints: 3,
          creatorId: user.id,
          sprintId: sprintId || null,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          position: (i + 1) * 1000,
          labels: {
            create: [{ labelId: notionLabel.id }],
          },
          activity: {
            create: {
              actorId: user.id,
              action: "CREATED",
              detail: `đã nhập task từ Notion (${item.title})`,
            },
          },
        },
        include: {
          assignee: { select: { id: true, name: true, avatarColor: true } },
          labels: { include: { label: true } },
          subtasks: true,
          _count: { select: { comments: true } },
        },
      });

      createdTasks.push(task);
    }

    // Bắn sự kiện realtime cập nhật Board
    publish(projectId, {
      type: "TASK_CREATED",
      taskId: createdTasks[0]?.id || "",
      actorId: user.id,
    });

    return NextResponse.json({
      success: true,
      importedCount: createdTasks.length,
      tasks: createdTasks,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi khi import dữ liệu Notion";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
