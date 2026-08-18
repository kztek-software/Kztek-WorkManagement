import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/bus";

import { canCreateTask } from "@/lib/permissions";

const taskInclude = {
  assignee: { select: { id: true, name: true, avatarColor: true } },
  labels: { include: { label: true } },
  subtasks: true,
  _count: { select: { comments: true } },
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

  const [project, tasks, sprints, labels, members] = await Promise.all([
    prisma.project.findUnique({ where: { id: projectId } }),
    prisma.task.findMany({
      where: { projectId },
      include: taskInclude,
      orderBy: { position: "asc" },
    }),
    prisma.sprint.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.label.findMany({ where: { projectId }, orderBy: { name: "asc" } }),
    prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, avatarColor: true, title: true } } },
    }),
  ]);

  if (!project) return NextResponse.json({ error: "Không tìm thấy project" }, { status: 404 });

  return NextResponse.json({ project, tasks, sprints, labels, members, currentRole: member.role });
}

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  type: z.enum(["TASK", "STORY", "BUG", "EPIC"]).default("TASK"),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  storyPoints: z.number().int().min(0).max(100).nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  sprintId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  labelIds: z.array(z.string()).optional(),
  subtasks: z.array(z.string()).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  if (!canCreateTask(member.role)) {
    return NextResponse.json({ error: "Người xem (Viewer) không có quyền tạo task" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu task không hợp lệ" }, { status: 400 });
  }
  const d = parsed.data;

  const lastTask = await prisma.task.findFirst({
    where: { projectId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const maxPos = await prisma.task.aggregate({
    where: { projectId, status: d.status },
    _max: { position: true },
  });

  const task = await prisma.task.create({
    data: {
      projectId,
      number: (lastTask?.number ?? 0) + 1,
      title: d.title,
      description: d.description,
      type: d.type,
      status: d.status,
      priority: d.priority,
      storyPoints: d.storyPoints ?? null,
      assigneeId: d.assigneeId,
      creatorId: user.id,
      sprintId: d.sprintId,
      dueDate: d.dueDate ? new Date(d.dueDate) : null,
      position: (maxPos._max.position ?? 0) + 1000,
      completedAt: d.status === "DONE" ? new Date() : null,
      labels: d.labelIds?.length
        ? { create: d.labelIds.map((labelId) => ({ labelId })) }
        : undefined,
      subtasks: d.subtasks?.length
        ? { create: d.subtasks.map((title) => ({ title })) }
        : undefined,
      activity: { create: { actorId: user.id, action: "CREATED", detail: "đã tạo task này" } },
    },
    include: taskInclude,
  });

  publish(projectId, { type: "TASK_CREATED", taskId: task.id, actorId: user.id });
  return NextResponse.json({ task }, { status: 201 });
}
