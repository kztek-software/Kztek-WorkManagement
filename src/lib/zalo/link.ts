import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const LINK_CODE_TTL_MINUTES = 15;

/**
 * Sinh mã liên kết 6 số cho user hiện tại — user gửi mã này tới Zalo OA của KZTEK để tự liên kết
 * tài khoản hệ thống với Zalo cá nhân (nhận thông báo OA miễn phí + chat).
 */
export async function generateZaloLinkCode(userId: string): Promise<{ code: string; expiresAt: Date }> {
  // Dọn các mã cũ chưa dùng của user này để tránh nhiều mã cùng tồn tại
  await prisma.zaloLinkCode.deleteMany({ where: { userId, consumedAt: null } });

  let code = "";
  // Đảm bảo mã không trùng với mã đang còn hiệu lực của người khác
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = crypto.randomInt(100000, 999999).toString();
    const existing = await prisma.zaloLinkCode.findUnique({ where: { code: candidate } });
    if (!existing) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    throw new Error("Không thể sinh mã liên kết Zalo, vui lòng thử lại");
  }

  const expiresAt = new Date(Date.now() + LINK_CODE_TTL_MINUTES * 60 * 1000);
  await prisma.zaloLinkCode.create({
    data: { code, userId, expiresAt },
  });

  return { code, expiresAt };
}

/**
 * Được webhook Zalo gọi khi nhận tin nhắn văn bản từ user chưa liên kết — nếu nội dung tin nhắn
 * khớp với một mã liên kết còn hiệu lực, tự động gắn zaloUserId vào tài khoản hệ thống tương ứng.
 * Trả về userId đã liên kết, hoặc null nếu không khớp mã nào.
 */
export async function consumeZaloLinkCode(rawText: string, zaloUserId: string): Promise<string | null> {
  const code = rawText.trim().replace(/[^0-9]/g, "");
  if (code.length !== 6) return null;

  const linkCode = await prisma.zaloLinkCode.findUnique({ where: { code } });
  if (!linkCode || linkCode.consumedAt || linkCode.expiresAt < new Date()) {
    return null;
  }

  await prisma.$transaction(async (tx) => {
    // zaloUserId là unique — nếu tài khoản Zalo này trước đó đã liên kết với 1 user khác
    // (VD: user cũ unlink rồi user mới follow lại), gỡ liên kết cũ trước để tránh lỗi constraint.
    await tx.user.updateMany({
      where: { zaloUserId, id: { not: linkCode.userId } },
      data: { zaloUserId: null, zaloLinkedAt: null },
    });

    await tx.zaloLinkCode.update({
      where: { id: linkCode.id },
      data: { consumedAt: new Date() },
    });

    await tx.user.update({
      where: { id: linkCode.userId },
      data: { zaloUserId, zaloLinkedAt: new Date() },
    });
  });

  return linkCode.userId;
}

/**
 * Hủy liên kết Zalo của user (dùng khi user muốn kết nối lại bằng tài khoản Zalo khác).
 */
export async function unlinkZalo(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { zaloUserId: null, zaloLinkedAt: null },
  });
}
