import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/bus";
import { notifyTaskAssigned } from "@/lib/notifications";
import { getTicketById, updateTicket } from "@/lib/tickets";

const convertSchema = z.object({
  sprintId: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  customTitle: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; ticketId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId, ticketId } = await params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (!member) {
      return NextResponse.json({ error: "Không có quyền truy cập dự án" }, { status: 403 });
    }

    const ticket = await getTicketById(ticketId, true);
    if (!ticket) {
      return NextResponse.json({ error: "Không tìm thấy ticket" }, { status: 404 });
    }
    if (ticket.projectId && ticket.projectId !== projectId) {
      return NextResponse.json({ error: "Ticket này thuộc dự án khác" }, { status: 400 });
    }

    // Nếu đã chuyển đổi trước đó
    if (ticket.convertedTaskId) {
      const existingTask = await prisma.task.findUnique({
        where: { id: ticket.convertedTaskId },
        select: { id: true, number: true, title: true, status: true },
      });
      if (existingTask) {
        return NextResponse.json(
          { error: `Ticket này đã được chuyển đổi thành task #${existingTask.number}` },
          { status: 400 }
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const parsed = convertSchema.safeParse(body);
    const d = parsed.success ? parsed.data : { status: "TODO" as const };

    // Tìm hoặc tạo nhãn "Báo lỗi KH"
    let customerLabel = await prisma.label.findFirst({
      where: { projectId, name: "Báo lỗi KH" },
    });
    if (!customerLabel) {
      customerLabel = await prisma.label.create({
        data: {
          projectId,
          name: "Báo lỗi KH",
          color: "#F05922",
        },
      });
    }

    // Lấy số thứ tự task tiếp theo
    const lastTask = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const taskNumber = (lastTask?.number ?? 0) + 1;

    // Lấy vị trí cột
    const maxPos = await prisma.task.aggregate({
      where: { projectId, status: d.status },
      _max: { position: true },
    });

    const taskTitle = d.customTitle?.trim() || `[${ticket.trackingCode}] ${ticket.title}`;
    
    let detailedDescription = `### 🎫 Nguồn: Báo lỗi từ khách hàng (${ticket.trackingCode})\n`;
    detailedDescription += `- **Khách hàng:** ${ticket.customerName} (${ticket.customerEmail}${ticket.customerPhone ? ` - ${ticket.customerPhone}` : ""})\n`;
    if (ticket.customerCompany) detailedDescription += `- **Đơn vị/Công ty:** ${ticket.customerCompany}\n`;
    if (ticket.environment) detailedDescription += `- **Môi trường/Thiết bị:** ${ticket.environment}\n`;
    detailedDescription += `\n---\n\n### 📝 Chi tiết sự cố:\n${ticket.description}`;

    // Tạo Task mới loại BUG trên Kanban Board
    const task = await prisma.task.create({
      data: {
        projectId,
        number: taskNumber,
        title: taskTitle,
        description: detailedDescription,
        type: "BUG",
        status: d.status,
        priority: d.priority || ticket.priority || "MEDIUM",
        assigneeId: d.assigneeId || null,
        sprintId: d.sprintId || null,
        creatorId: user.id,
        position: (maxPos._max.position ?? 0) + 1000,
        labels: {
          create: [{ labelId: customerLabel.id }],
        },
        activity: {
          create: {
            actorId: user.id,
            action: "CREATED",
            detail: `đã chuyển đổi từ Ticket ${ticket.trackingCode}`,
          },
        },
      },
      include: {
        assignee: { select: { id: true, name: true, avatarColor: true } },
        labels: { include: { label: true } },
      },
    });

    // Sao chép toàn bộ attachments của ticket sang task mới
    if (ticket.attachments && ticket.attachments.length > 0) {
      await prisma.attachment.createMany({
        data: ticket.attachments.map((att) => ({
          taskId: task.id,
          fileName: att.fileName,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileSize: att.fileSize,
          mimeType: att.mimeType,
          uploaderId: user.id,
        })),
      });
    }

    // Cập nhật ticket với convertedTaskId, projectId và đổi trạng thái sang IN_PROGRESS
    await updateTicket(ticketId, {
      projectId,
      convertedTaskId: task.id,
      status: "IN_PROGRESS",
    });

    // Bắn realtime event
    publish(projectId, {
      type: "TASK_CREATED",
      taskId: task.id,
      actorId: user.id,
    });

    publish(projectId, {
      type: "TICKET_UPDATED",
      ticketId,
      actorId: user.id,
    });

    // Gửi thông báo & Email giao việc nếu có gán người
    if (task.assigneeId && task.assigneeId !== user.id) {
      notifyTaskAssigned({
        taskId: task.id,
        assigneeId: task.assigneeId,
        actorId: user.id,
        projectId,
      });
    }

    const updatedTicket = await getTicketById(ticketId, true);

    return NextResponse.json({
      success: true,
      task,
      ticket: updatedTicket,
    }, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi chuyển đổi ticket sang task:", error);
    return NextResponse.json({ error: "Lỗi máy chủ khi chuyển đổi" }, { status: 500 });
  }
}
