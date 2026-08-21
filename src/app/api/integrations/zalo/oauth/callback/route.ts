import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { exchangeZaloAuthCode, ZaloApiError } from "@/lib/zalo/client";
import { getAppBaseUrl } from "@/lib/system-config";

/**
 * Zalo redirect người dùng (Admin) về đây sau khi họ đồng ý cấp quyền cho App, kèm `?code=...&state=<projectId>`.
 * `state` được trang Cài đặt gán = projectId hiện tại để biết đường quay lại đúng trang sau khi xử lý.
 * Route này đổi code lấy access_token/refresh_token và lưu vào SystemSetting, rồi redirect
 * lại trang Cài đặt Hệ thống (tab Zalo) kèm thông báo kết quả.
 */
export async function GET(req: NextRequest) {
  const rawState = req.nextUrl.searchParams.get("state") || "";
  // Chỉ chấp nhận state dạng projectId hợp lệ (chữ/số) để tránh open-redirect ra path lạ
  const projectId = /^[a-zA-Z0-9_-]+$/.test(rawState) ? rawState : "";

  const redirectTo = (status: "connected" | "error", message?: string) => {
    const url = new URL(`/projects/${projectId || "unknown"}/settings`, getAppBaseUrl());
    url.searchParams.set("zalo_oauth", status);
    if (message) url.searchParams.set("zalo_oauth_message", message);
    return NextResponse.redirect(url);
  };

  const currentUser = await getSessionUser(req);
  if (!currentUser || currentUser.role !== "ADMIN") {
    return redirectTo("error", "Chỉ Quản trị viên (ADMIN) mới có thể kết nối Zalo OA");
  }

  const code = req.nextUrl.searchParams.get("code");
  const oauthError = req.nextUrl.searchParams.get("error");
  if (oauthError) {
    return redirectTo("error", `Zalo từ chối cấp quyền: ${oauthError}`);
  }
  if (!code) {
    return redirectTo("error", "Thiếu tham số code từ Zalo callback");
  }

  try {
    await exchangeZaloAuthCode(code);
    return redirectTo("connected");
  } catch (error) {
    const message = error instanceof ZaloApiError ? error.message : "Lỗi không xác định khi đổi mã xác thực";
    console.error("Lỗi khi xử lý Zalo OAuth callback:", error);
    return redirectTo("error", message);
  }
}
