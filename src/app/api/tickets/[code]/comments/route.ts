import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTicketByTrackingCode, addTicketComment } from "@/lib/tickets";

const commentSchema = z.object({
  authorName: z.string().min(1, "Vui lòng nhập tên người gửi").max(100),
  authorEmail: z.string().email("Email không hợp lệ").optional().nullable(),
  message: z.string().min(1, "Nội dung phản hồi không được để trống").max(3000),
  isStaff: z.boolean().default(false),
  isInternalOnly: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const ticket = await getTicketByTrackingCode(code);
    if (!ticket) {
      return NextResponse.json({ error: "Không tìm thấy ticket" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const comment = await addTicketComment({
      ticketId: ticket.id,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail,
      message: parsed.data.message,
      isStaff: parsed.data.isStaff,
      isInternalOnly: parsed.data.isInternalOnly,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Lỗi khi thêm bình luận ticket:", error);
    return NextResponse.json(
      { error: "Không thể thêm phản hồi vào lúc này" },
      { status: 500 }
    );
  }
}
