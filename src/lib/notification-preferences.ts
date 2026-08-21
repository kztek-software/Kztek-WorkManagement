import { prisma } from "@/lib/prisma";

export type NotificationEventType = "ASSIGNED" | "STATUS_CHANGED" | "COMMENTED" | "MENTIONED";
export type NotificationChannel = "email" | "zalo" | "inApp" | "discord";

export type UserNotificationPreferenceData = {
  emailOnAssign: boolean;
  emailOnStatusChange: boolean;
  emailOnComment: boolean;
  emailOnMention: boolean;
  zaloOnAssign: boolean;
  zaloOnStatusChange: boolean;
  zaloOnComment: boolean;
  zaloOnMention: boolean;
  inAppOnAssign: boolean;
  inAppOnStatusChange: boolean;
  inAppOnComment: boolean;
  inAppOnMention: boolean;
  discordOnAssign: boolean;
  discordOnStatusChange: boolean;
  discordOnComment: boolean;
  discordOnMention: boolean;
};

// Mặc định: chưa tùy chỉnh gì -> nhận tất cả thông báo trên mọi kênh (giữ nguyên hành vi cũ của hệ thống)
export const DEFAULT_NOTIFICATION_PREFERENCE: UserNotificationPreferenceData = {
  emailOnAssign: true,
  emailOnStatusChange: true,
  emailOnComment: true,
  emailOnMention: true,
  zaloOnAssign: true,
  zaloOnStatusChange: true,
  zaloOnComment: true,
  zaloOnMention: true,
  inAppOnAssign: true,
  inAppOnStatusChange: true,
  inAppOnComment: true,
  inAppOnMention: true,
  discordOnAssign: true,
  discordOnStatusChange: true,
  discordOnComment: true,
  discordOnMention: true,
};

const EVENT_FIELD_SUFFIX: Record<NotificationEventType, string> = {
  ASSIGNED: "OnAssign",
  STATUS_CHANGED: "OnStatusChange",
  COMMENTED: "OnComment",
  MENTIONED: "OnMention",
};

/**
 * Lấy tùy chọn thông báo của 1 user — trả về mặc định (nhận tất cả) nếu user chưa từng tùy chỉnh.
 */
export async function getUserNotificationPreference(userId: string): Promise<UserNotificationPreferenceData> {
  const row = await prisma.userNotificationPreference.findUnique({ where: { userId } });
  if (!row) return DEFAULT_NOTIFICATION_PREFERENCE;

  return {
    emailOnAssign: row.emailOnAssign,
    emailOnStatusChange: row.emailOnStatusChange,
    emailOnComment: row.emailOnComment,
    emailOnMention: row.emailOnMention,
    zaloOnAssign: row.zaloOnAssign,
    zaloOnStatusChange: row.zaloOnStatusChange,
    zaloOnComment: row.zaloOnComment,
    zaloOnMention: row.zaloOnMention,
    inAppOnAssign: row.inAppOnAssign,
    inAppOnStatusChange: row.inAppOnStatusChange,
    inAppOnComment: row.inAppOnComment,
    inAppOnMention: row.inAppOnMention,
    discordOnAssign: row.discordOnAssign,
    discordOnStatusChange: row.discordOnStatusChange,
    discordOnComment: row.discordOnComment,
    discordOnMention: row.discordOnMention,
  };
}

/**
 * Kiểm tra 1 kênh (email/zalo/inApp/discord) có được PHÉP gửi cho 1 loại sự kiện theo tùy chọn cá nhân của user không.
 * Đây chỉ là lớp lọc thứ 2 — vẫn cần kết hợp AND với công tắc tổng ở SystemSetting trước khi thực sự gửi.
 */
export function isChannelEnabledForEvent(
  pref: UserNotificationPreferenceData,
  channel: NotificationChannel,
  event: NotificationEventType
): boolean {
  const key = `${channel}${EVENT_FIELD_SUFFIX[event]}` as keyof UserNotificationPreferenceData;
  return pref[key];
}

/**
 * Cập nhật (upsert) tùy chọn thông báo cá nhân của user hiện tại.
 */
export async function updateUserNotificationPreference(
  userId: string,
  updates: Partial<UserNotificationPreferenceData>
): Promise<UserNotificationPreferenceData> {
  const existing = await getUserNotificationPreference(userId);
  const merged = { ...existing, ...updates };

  const saved = await prisma.userNotificationPreference.upsert({
    where: { userId },
    update: merged,
    create: { userId, ...merged },
  });

  return {
    emailOnAssign: saved.emailOnAssign,
    emailOnStatusChange: saved.emailOnStatusChange,
    emailOnComment: saved.emailOnComment,
    emailOnMention: saved.emailOnMention,
    zaloOnAssign: saved.zaloOnAssign,
    zaloOnStatusChange: saved.zaloOnStatusChange,
    zaloOnComment: saved.zaloOnComment,
    zaloOnMention: saved.zaloOnMention,
    inAppOnAssign: saved.inAppOnAssign,
    inAppOnStatusChange: saved.inAppOnStatusChange,
    inAppOnComment: saved.inAppOnComment,
    inAppOnMention: saved.inAppOnMention,
    discordOnAssign: saved.discordOnAssign,
    discordOnStatusChange: saved.discordOnStatusChange,
    discordOnComment: saved.discordOnComment,
    discordOnMention: saved.discordOnMention,
  };
}
