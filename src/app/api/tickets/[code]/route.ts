import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTicketByTrackingCode } from "@/lib/tickets";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: "Mã tra cứu không hợp lệ" }, { status: 400 });
    }

    const ticket = await getTicketByTrackingCode(code);
    if (!ticket) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin ticket với mã tra cứu này" },
        { status: 404 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: ticket.projectId },
      select: { id: true, name: true, key: true },
    });

    return NextResponse.json({
      ticket: {
        ...ticket,
        project,
      },
    });
  } catch (error) {
    console.error("Lỗi khi tra cứu ticket:", error);
    return NextResponse.json(
      { error: "Lỗi máy chủ khi tra cứu ticket" },
      { status: 500 }
    );
  }
}
