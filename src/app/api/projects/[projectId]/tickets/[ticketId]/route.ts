import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getTicketById, updateTicket, addTicketComment } from "@/lib/tickets";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; ticketId: string }> }
) {
  try {
    const user = await requireUser();
    const { projectId, ticketId } = await params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (!member) {
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const ticket = await getTicketById(ticketId, true);
    if (!ticket || ticket.projectId !== projectId) {
      return NextResponse.json({ error: "Không tìm thấy ticket" }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết ticket:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}

const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED", "REJECTED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  type: z.enum(["BUG", "SUPPORT", "INQUIRY", "FEATURE_REQ"]).optional(),
  internalNotes: z.string().nullable().optional(),
  resolutionNotes: z.string().nullable().optional(),
  newComment: z.object({
    message: z.string().min(1),
    isInternalOnly: z.boolean().default(false),
  }).optional(),
});

export async function PATCH(
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
      return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const parsed = updateTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const d = parsed.data;

    // Update ticket fields
    const updated = await updateTicket(ticketId, {
      status: d.status,
      priority: d.priority,
      type: d.type,
      internalNotes: d.internalNotes,
      resolutionNotes: d.resolutionNotes,
    });

    // Add comment if requested
    if (d.newComment && d.newComment.message.trim()) {
      await addTicketComment({
        ticketId,
        authorName: user.name,
        authorEmail: user.email,
        isStaff: true,
        isInternalOnly: d.newComment.isInternalOnly,
        message: d.newComment.message,
      });
    }

    const result = await getTicketById(ticketId, true);
    return NextResponse.json({ ticket: result });
  } catch (error) {
    console.error("Lỗi khi cập nhật ticket:", error);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
