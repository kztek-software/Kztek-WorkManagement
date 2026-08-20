import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { dispatchTicketToProject, getTicketById } from "@/lib/tickets";
import { sendNotification } from "@/lib/notifications";
import { publish } from "@/lib/bus";

const dispatchSchema = z
  .object({
    targetProjectId: z.string().optional(),
    projectId: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => Boolean(data.targetProjectId || data.projectId), {
    message: "Vui lòng chọn dự án đích",
    path: ["targetProjectId"],
  });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
    }

    const { ticketId } = await params;
    const body = await req.json().catch(() => null);
    const parsed = dispatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const targetProjectId = (parsed.data.targetProjectId || parsed.data.projectId)!;
    const notes = parsed.data.notes;

    // Check if target project exists
    const targetProject = await prisma.project.findUnique({
      where: { id: targetProjectId },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    if (!targetProject) {
      return NextResponse.json({ error: "Không tìm thấy dự án đích" }, { status: 404 });
    }

    // Check permissions: Admin or member of target project
    const isSystemAdmin = user.role === "ADMIN";
    const isProjectMember = targetProject.members.some((m) => m.userId === user.id);

    if (!isSystemAdmin && !isProjectMember) {
      return NextResponse.json(
        { error: "Bạn không có quyền điều phối ticket tới dự án này" },
        { status: 403 }
      );
    }

    // Execute dispatch
    const updatedTicket = await dispatchTicketToProject({
      ticketId,
      targetProjectId,
      adminUser: { id: user.id, name: user.name },
    });

    if (!updatedTicket) {
      return NextResponse.json({ error: "Không tìm thấy ticket để điều phối" }, { status: 404 });
    }

    // Notify project members (PM, Tech Lead, etc.)
    for (const member of targetProject.members) {
      if (member.userId === user.id) continue;
      await sendNotification({
        userId: member.userId,
        type: "TICKET_CREATED",
        title: `🎫 Ticket mới được điều phối: ${updatedTicket.title}`,
        message: `${user.name} đã điều phối ticket "${updatedTicket.trackingCode}" từ khách hàng ${updatedTicket.customerName} tới dự án ${targetProject.name}.`,
        link: `/projects/${targetProject.id}/tickets?ticketId=${updatedTicket.id}`,
      }).catch((e) => console.error("Lỗi gửi thông báo điều phối:", e));
    }

    // Publish realtime SSE event to the target project room
    publish(targetProject.id, {
      type: "TICKET_UPDATED",
      ticketId: updatedTicket.id,
      actorId: user.id,
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      message: `Đã điều phối thành công ticket tới dự án ${targetProject.name}`,
    });
  } catch (error) {
    console.error("Lỗi khi điều phối ticket:", error);
    return NextResponse.json({ error: "Lỗi hệ thống khi điều phối ticket" }, { status: 500 });
  }
}
