import crypto from "node:crypto";
import { getEffectiveZaloConfig, updateZaloTokensAsync } from "@/lib/system-config";

// ============================================================================
// Client gọi trực tiếp Zalo Open API (OAuth v4 + ZNS + OA Message).
//
// ⚠️ LƯU Ý QUAN TRỌNG: Các endpoint dưới đây được tổng hợp từ tài liệu công khai
// của Zalo For Developers (developers.zalo.me) tại thời điểm viết code này.
// KZTEK CHƯA có App/OA thật để test end-to-end — trước khi dùng thật ở production,
// cần đối chiếu lại với tài liệu chính thức (đăng nhập developers.zalo.me bằng
// tài khoản App đã tạo) vì Zalo có thể thay đổi endpoint/field theo thời gian.
// ============================================================================

const OAUTH_TOKEN_URL = "https://oauth.zaloapp.com/v4/oa/access_token";
const OAUTH_PERMISSION_URL = "https://oauth.zaloapp.com/v4/oa/permission";
const ZNS_SEND_URL = "https://business.openapi.zalo.me/message/template";
const OA_MESSAGE_URL = "https://openapi.zalo.me/v3.0/oa/message/cs";

export class ZaloApiError extends Error {
  constructor(message: string, public readonly raw?: unknown) {
    super(message);
    this.name = "ZaloApiError";
  }
}

/**
 * Sinh URL để Admin bấm "Kết nối OA" — mở màn hình Zalo xin quyền, redirect về `redirectUri`
 * kèm `?code=...` để trao đổi lấy access_token.
 */
export function buildZaloAuthorizationUrl(redirectUri: string, state: string): string {
  const cfg = getEffectiveZaloConfig();
  const params = new URLSearchParams({
    app_id: cfg.appId,
    redirect_uri: redirectUri,
    state,
  });
  return `${OAUTH_PERMISSION_URL}?${params.toString()}`;
}

type ZaloTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: string | number;
  error?: string | number;
  error_name?: string;
  error_description?: string;
};

async function requestToken(body: Record<string, string>): Promise<{ accessToken: string; refreshToken: string; expiresInSeconds: number }> {
  const cfg = getEffectiveZaloConfig();
  if (!cfg.appId || !cfg.appSecret) {
    throw new ZaloApiError("Chưa cấu hình App ID / App Secret Zalo trong Cài đặt Hệ thống");
  }

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      secret_key: cfg.appSecret,
    },
    body: new URLSearchParams(body).toString(),
  });

  const data = (await res.json().catch(() => ({}))) as ZaloTokenResponse;

  if (!res.ok || !data.access_token || !data.refresh_token) {
    throw new ZaloApiError(
      `Zalo OAuth thất bại: ${data.error_description || data.error_name || res.statusText}`,
      data
    );
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresInSeconds: data.expires_in ? Number(data.expires_in) : 3600,
  };
}

/**
 * Đổi authorization code (nhận từ callback OAuth) lấy access_token + refresh_token, rồi lưu vào SystemSetting.
 */
export async function exchangeZaloAuthCode(code: string): Promise<void> {
  const cfg = getEffectiveZaloConfig();
  const tokens = await requestToken({
    app_id: cfg.appId,
    code,
    grant_type: "authorization_code",
  });
  await updateZaloTokensAsync(tokens);
}

/**
 * Làm mới access_token bằng refresh_token hiện có, lưu token mới vào SystemSetting.
 * Lưu ý: theo tài liệu Zalo, refresh_token chỉ dùng được 1 lần — mỗi lần refresh sẽ nhận refresh_token mới.
 */
export async function refreshZaloAccessToken(): Promise<string> {
  const cfg = getEffectiveZaloConfig();
  if (!cfg.refreshToken) {
    throw new ZaloApiError("Chưa có refresh_token — cần bấm 'Kết nối OA' lại từ đầu trong Cài đặt Hệ thống");
  }
  const tokens = await requestToken({
    app_id: cfg.appId,
    refresh_token: cfg.refreshToken,
    grant_type: "refresh_token",
  });
  await updateZaloTokensAsync(tokens);
  return tokens.accessToken;
}

/**
 * Lấy access_token còn hiệu lực — tự động refresh nếu đã hết hạn hoặc gần hết hạn (< 5 phút).
 */
export async function ensureValidZaloAccessToken(): Promise<string> {
  const cfg = getEffectiveZaloConfig();
  if (!cfg.accessToken) {
    throw new ZaloApiError("Chưa kết nối OA Zalo — vào Cài đặt Hệ thống > Zalo để kết nối");
  }
  const expiresAt = cfg.tokenExpiresAt ? new Date(cfg.tokenExpiresAt).getTime() : 0;
  const isExpiringSoon = expiresAt - Date.now() < 5 * 60 * 1000;
  if (isExpiringSoon) {
    return refreshZaloAccessToken();
  }
  return cfg.accessToken;
}

/**
 * Gửi tin nhắn ZNS (Zalo Notification Service) theo số điện thoại — tính phí theo mỗi tin gửi thành công,
 * yêu cầu template đã được Zalo duyệt trước.
 */
export async function sendZnsTemplateMessage(params: {
  phone: string;
  templateId: string;
  templateData: Record<string, string>;
  trackingId?: string;
}): Promise<{ msgId?: string }> {
  const accessToken = await ensureValidZaloAccessToken();

  const res = await fetch(ZNS_SEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: accessToken,
    },
    body: JSON.stringify({
      phone: normalizeVietnamesePhone(params.phone),
      template_id: params.templateId,
      template_data: params.templateData,
      tracking_id: params.trackingId,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error !== 0) {
    throw new ZaloApiError(`Gửi ZNS thất bại: ${data.message || res.statusText}`, data);
  }
  return { msgId: data.data?.msg_id };
}

/**
 * Gửi tin nhắn văn bản qua OA (miễn phí) — CHỈ gửi được cho user đã follow/tương tác OA
 * trong vòng 7 ngày gần nhất (theo chính sách Customer Service message của Zalo).
 */
export async function sendOaTextMessage(zaloUserId: string, text: string): Promise<{ msgId?: string }> {
  const accessToken = await ensureValidZaloAccessToken();

  const res = await fetch(OA_MESSAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: accessToken,
    },
    body: JSON.stringify({
      recipient: { user_id: zaloUserId },
      message: { text },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error !== 0) {
    throw new ZaloApiError(`Gửi tin nhắn OA thất bại: ${data.message || res.statusText}`, data);
  }
  return { msgId: data.data?.message_id };
}

/**
 * Xác thực chữ ký webhook Zalo OA gửi tới (header `X-ZEvent-Signature: mac=<hash>`).
 * Công thức: sha256(app_id + rawBody + timestamp + oaSecretKey), theo tài liệu Zalo OA Webhook.
 */
export function verifyZaloWebhookSignature(params: {
  rawBody: string;
  appId: string;
  timestamp: string;
  oaSecretKey: string;
  signatureHeader: string | null;
}): boolean {
  if (!params.signatureHeader || !params.oaSecretKey) return false;

  // Header thường có dạng "mac=<hash>"
  const receivedMac = params.signatureHeader.startsWith("mac=")
    ? params.signatureHeader.slice(4)
    : params.signatureHeader;

  const baseString = params.appId + params.rawBody + params.timestamp + params.oaSecretKey;
  const expectedMac = crypto.createHash("sha256").update(baseString).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(receivedMac), Buffer.from(expectedMac));
  } catch {
    // Độ dài buffer khác nhau -> chắc chắn không khớp
    return false;
  }
}

/**
 * Chuẩn hoá số điện thoại VN về định dạng quốc tế Zalo yêu cầu (84xxxxxxxxx, không có dấu +/0 đầu).
 */
export function normalizeVietnamesePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("84")) return digits;
  if (digits.startsWith("0")) return `84${digits.slice(1)}`;
  return digits;
}
