import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { generateZaloLinkCode, unlinkZalo } from "@/lib/zalo/link";
import { getEffectiveZaloConfig } from "@/lib/system-config";

/**
 * GET: Trạng thái liên kết Zalo của user hiện tại (dùng cho modal "Kết nối Zalo" trong menu tài khoản).
 */
export async function GET() {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { zaloUserId: true, zaloLinkedAt: true, phone: true },
  });

  const cfg = getEffectiveZaloConfig();

  return NextResponse.json({
    linked: !!user?.zaloUserId,
    linkedAt: user?.zaloLinkedAt,
    phone: user?.phone,
    integrationEnabled: cfg.enabled,
    oaId: cfg.oaId,
  });
}

/**
 * POST: Sinh mã liên kết 6 số mới để user gửi tới Zalo OA của KZTEK.
 */
export async function POST() {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const cfg = getEffectiveZaloConfig();
  if (!cfg.enabled || !cfg.oaId) {
    return NextResponse.json(
      { error: "Hệ thống chưa bật tích hợp Zalo. Vui lòng liên hệ Quản trị viên." },
      { status: 400 }
    );
  }

  try {
    const { code, expiresAt } = await generateZaloLinkCode(currentUser.id);
    return NextResponse.json({ code, expiresAt, oaId: cfg.oaId });
  } catch (error) {
    console.error("Lỗi khi sinh mã liên kết Zalo:", error);
    return NextResponse.json({ error: "Không thể sinh mã liên kết, vui lòng thử lại" }, { status: 500 });
  }
}

/**
 * DELETE: Hủy liên kết Zalo hiện tại của user.
 */
export async function DELETE(_req: NextRequest) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  await unlinkZalo(currentUser.id);
  return NextResponse.json({ ok: true });
}
