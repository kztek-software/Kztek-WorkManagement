import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { getUserNotificationPreference, updateUserNotificationPreference } from "@/lib/notification-preferences";
import { getSystemConfigAsync } from "@/lib/system-config";

/**
 * GET: Tùy chọn thông báo cá nhân của user hiện tại + công tắc tổng hệ thống (để UI biết field nào bị khóa/mờ đi).
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const [preference, systemConfig] = await Promise.all([
    getUserNotificationPreference(user.id),
    getSystemConfigAsync(),
  ]);

  return NextResponse.json({
    preference,
    systemDefaults: {
      email: systemConfig.notifications,
      zaloEnabled: systemConfig.zalo.enabled,
      zalo: {
        notifyOnAssign: systemConfig.zalo.notifyOnAssign,
        notifyOnStatusChange: systemConfig.zalo.notifyOnStatusChange,
        notifyOnComment: systemConfig.zalo.notifyOnComment,
      },
    },
  });
}

const updatePreferenceSchema = z.object({
  emailOnAssign: z.boolean().optional(),
  emailOnStatusChange: z.boolean().optional(),
  emailOnComment: z.boolean().optional(),
  emailOnMention: z.boolean().optional(),
  zaloOnAssign: z.boolean().optional(),
  zaloOnStatusChange: z.boolean().optional(),
  zaloOnComment: z.boolean().optional(),
  zaloOnMention: z.boolean().optional(),
  inAppOnAssign: z.boolean().optional(),
  inAppOnStatusChange: z.boolean().optional(),
  inAppOnComment: z.boolean().optional(),
  inAppOnMention: z.boolean().optional(),
});

/**
 * PATCH: Lưu tùy chọn thông báo cá nhân — mỗi user chỉ sửa được của chính mình (không cần quyền ADMIN).
 */
export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updatePreferenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu tùy chọn không hợp lệ" }, { status: 400 });
  }

  const preference = await updateUserNotificationPreference(user.id, parsed.data);
  return NextResponse.json({ success: true, preference });
}
