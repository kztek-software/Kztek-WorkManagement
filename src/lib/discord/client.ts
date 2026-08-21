import { getEffectiveDiscordConfig } from "@/lib/system-config";

// ============================================================================
// Client gọi trực tiếp Discord API (OAuth2 identify + Bot REST DM + Incoming Webhook).
// Tài liệu tham khảo: https://discord.com/developers/docs
//
// Khác với Zalo, phần gửi tin (DM qua Bot, đăng Webhook) chỉ dùng REST API thuần —
// KHÔNG cần mở kết nối Gateway (WebSocket) thường trực, nên hoàn toàn phù hợp chạy
// trong route handler Next.js (stateless). Lưu ý quan trọng: Bot chỉ mở DM được với
// user nào CÙNG có mặt trong ít nhất 1 server (guild) mà Bot cũng là thành viên.
// ============================================================================

const OAUTH_AUTHORIZE_URL = "https://discord.com/oauth2/authorize";
const OAUTH_TOKEN_URL = "https://discord.com/api/oauth2/token";
const API_BASE = "https://discord.com/api/v10";

export class DiscordApiError extends Error {
  constructor(message: string, public readonly raw?: unknown) {
    super(message);
    this.name = "DiscordApiError";
  }
}

/**
 * Sinh URL để user bấm "Kết nối Discord" — mở màn hình Discord xin quyền `identify`,
 * redirect về `redirectUri` kèm `?code=...` để đổi lấy thông tin user (id + username).
 */
export function buildDiscordAuthorizationUrl(redirectUri: string, state: string): string {
  const cfg = getEffectiveDiscordConfig();
  const params = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
    state,
  });
  return `${OAUTH_AUTHORIZE_URL}?${params.toString()}`;
}

type DiscordTokenResponse = {
  access_token?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type DiscordUserResponse = {
  id: string;
  username: string;
  global_name?: string | null;
  message?: string; // khi lỗi
};

/**
 * Đổi authorization code lấy access_token, rồi gọi /users/@me để lấy id + username Discord.
 * Access token OAuth chỉ dùng 1 lần để định danh — KHÔNG lưu lại (không cần thiết cho việc gửi DM sau này,
 * vì gửi DM dùng Bot Token riêng, không phụ thuộc access token của user).
 */
export async function exchangeDiscordAuthCode(
  code: string,
  redirectUri: string
): Promise<{ discordUserId: string; discordUsername: string }> {
  const cfg = getEffectiveDiscordConfig();
  if (!cfg.clientId || !cfg.clientSecret) {
    throw new DiscordApiError("Chưa cấu hình Client ID / Client Secret Discord trong Cài đặt Hệ thống");
  }

  const tokenRes = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  const tokenData = (await tokenRes.json().catch(() => ({}))) as DiscordTokenResponse;
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new DiscordApiError(`Discord OAuth thất bại: ${tokenData.error_description || tokenRes.statusText}`, tokenData);
  }

  const userRes = await fetch(`${API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = (await userRes.json().catch(() => ({}))) as DiscordUserResponse;
  if (!userRes.ok || !userData.id) {
    throw new DiscordApiError(`Không lấy được thông tin user Discord: ${userData.message || userRes.statusText}`, userData);
  }

  return {
    discordUserId: userData.id,
    discordUsername: userData.global_name || userData.username,
  };
}

/**
 * Gửi tin nhắn DM riêng cho 1 user Discord — dùng Bot Token (REST thuần, không cần Gateway).
 * Yêu cầu: Bot phải cùng server (guild) với user này thì mới mở được kênh DM.
 */
export async function sendDiscordDM(discordUserId: string, content: string): Promise<{ messageId?: string }> {
  const cfg = getEffectiveDiscordConfig();
  if (!cfg.botToken) {
    throw new DiscordApiError("Chưa cấu hình Bot Token Discord trong Cài đặt Hệ thống");
  }

  const dmChannelRes = await fetch(`${API_BASE}/users/@me/channels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${cfg.botToken}`,
    },
    body: JSON.stringify({ recipient_id: discordUserId }),
  });
  const dmChannel = await dmChannelRes.json().catch(() => ({}));
  if (!dmChannelRes.ok || !dmChannel.id) {
    throw new DiscordApiError(
      `Không mở được kênh DM (user có thể chưa cùng server với Bot): ${dmChannel.message || dmChannelRes.statusText}`,
      dmChannel
    );
  }

  const sendRes = await fetch(`${API_BASE}/channels/${dmChannel.id}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${cfg.botToken}`,
    },
    body: JSON.stringify({ content }),
  });
  const sendData = await sendRes.json().catch(() => ({}));
  if (!sendRes.ok) {
    throw new DiscordApiError(`Gửi DM Discord thất bại: ${sendData.message || sendRes.statusText}`, sendData);
  }

  return { messageId: sendData.id };
}

export type DiscordEmbed = {
  title: string;
  description: string;
  url?: string;
  color?: number; // decimal, không phải hex string
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string; // ISO string
};

async function postToWebhook(payload: { content?: string; embeds?: DiscordEmbed[] }): Promise<void> {
  const cfg = getEffectiveDiscordConfig();
  if (!cfg.webhookUrl) {
    throw new DiscordApiError("Chưa cấu hình Discord Webhook URL trong Cài đặt Hệ thống");
  }

  const res = await fetch(cfg.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new DiscordApiError(`Đăng Webhook Discord thất bại (HTTP ${res.status}): ${errText}`);
  }
}

/**
 * Đăng tin nhắn văn bản thuần vào kênh chung qua Incoming Webhook (dùng cho nút "Gửi Thử").
 */
export async function sendDiscordWebhook(content: string): Promise<void> {
  await postToWebhook({ content });
}

/**
 * Đăng 1 Embed (khung có màu, tiêu đề bấm được, các trường thông tin rõ ràng) vào kênh chung
 * qua Incoming Webhook — không cần Bot/OAuth, chỉ cần Webhook URL (Admin tự tạo trong Discord:
 * Cài đặt kênh > Tích hợp > Webhook > Tạo Webhook, copy URL).
 */
export async function sendDiscordWebhookEmbed(embed: DiscordEmbed): Promise<void> {
  await postToWebhook({ embeds: [embed] });
}
