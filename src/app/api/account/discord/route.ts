import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { getEffectiveDiscordConfig, getAppBaseUrl } from "@/lib/system-config";
import { buildDiscordAuthorizationUrl } from "@/lib/discord/client";

/**
 * GET: Trạng thái liên kết Discord của user hiện tại + URL OAuth để bấm "Kết nối Discord".
 * Query `returnTo` (đường dẫn tương đối, VD /projects/x/board) được gắn vào `state` để
 * callback biết đường điều hướng lại đúng trang sau khi xử lý xong.
 */
export async function GET(req: NextRequest) {
  const currentUser = await getSessionUser(req);
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: { discordUserId: true, discordUsername: true, discordLinkedAt: true },
  });

  const cfg = getEffectiveDiscordConfig();
  const rawReturnTo = req.nextUrl.searchParams.get("returnTo") || "/";
  const returnTo = rawReturnTo.startsWith("/") ? rawReturnTo : "/";
  const redirectUri = `${getAppBaseUrl()}/api/integrations/discord/oauth/callback`;

  return NextResponse.json({
    linked: !!user?.discordUserId,
    username: user?.discordUsername,
    linkedAt: user?.discordLinkedAt,
    integrationEnabled: cfg.enabled,
    authorizeUrl: cfg.enabled && cfg.clientId ? buildDiscordAuthorizationUrl(redirectUri, returnTo) : null,
  });
}

/**
 * DELETE: Hủy liên kết Discord hiện tại của user.
 */
export async function DELETE() {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: currentUser.id },
    data: { discordUserId: null, discordUsername: null, discordLinkedAt: null },
  });

  return NextResponse.json({ ok: true });
}
