import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    // Check if attachment exists
    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Không tìm thấy tệp đính kèm" }, { status: 404 });
    }

    await prisma.attachment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Đã xóa tệp đính kèm" });
  } catch (error) {
    console.error("Lỗi xóa attachment:", error);
    return NextResponse.json({ error: "Không thể xóa tệp đính kèm" }, { status: 500 });
  }
}
