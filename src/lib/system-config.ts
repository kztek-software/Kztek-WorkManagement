import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import type { SmtpConfig } from "@/lib/mail";

// Cấu hình hệ thống được lưu vào bảng `SystemSetting` trong cơ sở dữ liệu SQL Server (qua Prisma)
// và được đồng bộ sao lưu ra file JSON `data/system-config.json` để đảm bảo:
// 1. Không bị mất cấu hình khi service restart / container redeploy.
// 2. Không bị phụ thuộc vào local filesystem nếu chạy trong môi trường phân tán / multi-instance.
// 3. Có cơ chế fallback và cache in-memory truy xuất nhanh tức thì cho các tác vụ gửi mail/thông báo.
const CONFIG_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(CONFIG_DIR, "system-config.json");

export type SystemBrandingConfig = {
  systemName: string;
  companyName: string;
  hotline: string;
  supportEmail: string;
  website: string;
  appUrl: string; // URL cơ sở của ứng dụng (VD: https://work.kztek.net, http://192.168.1.50:3000)
};

export type SystemNotificationRules = {
  notifyOnAssign: boolean;
  notifyOnStatusChange: boolean;
  notifyOnComment: boolean;
  enableRealtimeSse: boolean;
};

export type SystemConfigData = {
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    from: string;
    fromName: string;
  };
  branding: SystemBrandingConfig;
  notifications: SystemNotificationRules;
  updatedAt: string;
  updatedBy?: string;
};

// Cấu hình mặc định lấy từ biến môi trường, dùng khi chưa có DB record và chưa có file JSON
function getDefaultSystemConfig(): SystemConfigData {
  return {
    smtp: {
      host: process.env.SMTP_HOST || "",
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
      from: process.env.SMTP_FROM || "no-reply@kztek.net",
      fromName: process.env.SMTP_FROM_NAME || "KZTEK Work Management",
    },
    branding: {
      systemName: "KZTEK Work Management",
      companyName: "CÔNG TY CỔ PHẦN CÔNG NGHỆ KZTEK",
      hotline: "024 3782 2288",
      supportEmail: "support@kztek.net",
      website: "https://kztek.net",
      appUrl: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    },
    notifications: {
      notifyOnAssign: true,
      notifyOnStatusChange: true,
      notifyOnComment: true,
      enableRealtimeSse: true,
    },
    updatedAt: new Date().toISOString(),
    updatedBy: "Hệ thống (Mặc định)",
  };
}

// Đọc cấu hình từ đĩa (nếu tồn tại) và merge đè lên mặc định
function loadSystemConfigFromDisk(): SystemConfigData {
  const defaults = getDefaultSystemConfig();
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return defaults;
    }
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    const saved = JSON.parse(raw) as Partial<SystemConfigData>;
    return {
      smtp: { ...defaults.smtp, ...saved.smtp },
      branding: { ...defaults.branding, ...saved.branding },
      notifications: { ...defaults.notifications, ...saved.notifications },
      updatedAt: saved.updatedAt || defaults.updatedAt,
      updatedBy: saved.updatedBy || defaults.updatedBy,
    };
  } catch (error) {
    console.error("⚠️ Không đọc được file cấu hình hệ thống đã lưu, dùng mặc định:", error);
    return defaults;
  }
}

// Ghi cấu hình hiện tại xuống đĩa làm backup dự phòng
function persistSystemConfigToDisk(config: SystemConfigData): void {
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("⚠️ Không ghi được file cấu hình hệ thống xuống đĩa:", error);
  }
}

// In-memory cache, được nạp ban đầu từ file disk hoặc default khi module khởi động
let currentSystemConfig: SystemConfigData = loadSystemConfigFromDisk();
let isDbLoaded = false;

// Chuyển đổi bản ghi SystemSetting từ Prisma sang SystemConfigData
function mapDbRecordToConfig(record: {
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpSecure: boolean;
  smtpFrom: string;
  smtpFromName: string;
  systemName: string;
  companyName: string;
  hotline: string;
  supportEmail: string;
  website: string;
  appUrl: string;
  notifyOnAssign: boolean;
  notifyOnStatusChange: boolean;
  notifyOnComment: boolean;
  enableRealtimeSse: boolean;
  updatedAt: Date;
  updatedBy: string | null;
}): SystemConfigData {
  const defaults = getDefaultSystemConfig();
  return {
    smtp: {
      host: record.smtpHost ?? defaults.smtp.host,
      port: record.smtpPort || defaults.smtp.port,
      user: record.smtpUser ?? defaults.smtp.user,
      pass: record.smtpPass ?? defaults.smtp.pass,
      secure: record.smtpSecure ?? defaults.smtp.secure,
      from: record.smtpFrom || defaults.smtp.from,
      fromName: record.smtpFromName || defaults.smtp.fromName,
    },
    branding: {
      systemName: record.systemName || defaults.branding.systemName,
      companyName: record.companyName || defaults.branding.companyName,
      hotline: record.hotline || defaults.branding.hotline,
      supportEmail: record.supportEmail || defaults.branding.supportEmail,
      website: record.website || defaults.branding.website,
      appUrl: record.appUrl || defaults.branding.appUrl,
    },
    notifications: {
      notifyOnAssign: record.notifyOnAssign ?? defaults.notifications.notifyOnAssign,
      notifyOnStatusChange: record.notifyOnStatusChange ?? defaults.notifications.notifyOnStatusChange,
      notifyOnComment: record.notifyOnComment ?? defaults.notifications.notifyOnComment,
      enableRealtimeSse: record.enableRealtimeSse ?? defaults.notifications.enableRealtimeSse,
    },
    updatedAt: record.updatedAt ? record.updatedAt.toISOString() : defaults.updatedAt,
    updatedBy: record.updatedBy || defaults.updatedBy,
  };
}

/**
 * Nạp cấu hình từ bảng `SystemSetting` trong cơ sở dữ liệu SQL Server.
 * Nếu bảng chưa có bản ghi, tự động seed từ cấu hình disk/env hiện tại vào DB.
 */
export async function loadSystemConfigFromDb(): Promise<SystemConfigData> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { id: "default" },
    });

    if (setting) {
      currentSystemConfig = mapDbRecordToConfig(setting);
      isDbLoaded = true;
      persistSystemConfigToDisk(currentSystemConfig);
      return { ...currentSystemConfig };
    }

    // Nếu chưa có trong DB, lấy cấu hình hiện có trên disk / default để seed vào DB
    const initialConfig = loadSystemConfigFromDisk();
    const created = await prisma.systemSetting.create({
      data: {
        id: "default",
        smtpHost: initialConfig.smtp.host,
        smtpPort: initialConfig.smtp.port,
        smtpUser: initialConfig.smtp.user,
        smtpPass: initialConfig.smtp.pass,
        smtpSecure: initialConfig.smtp.secure,
        smtpFrom: initialConfig.smtp.from,
        smtpFromName: initialConfig.smtp.fromName,
        systemName: initialConfig.branding.systemName,
        companyName: initialConfig.branding.companyName,
        hotline: initialConfig.branding.hotline,
        supportEmail: initialConfig.branding.supportEmail,
        website: initialConfig.branding.website,
        appUrl: initialConfig.branding.appUrl,
        notifyOnAssign: initialConfig.notifications.notifyOnAssign,
        notifyOnStatusChange: initialConfig.notifications.notifyOnStatusChange,
        notifyOnComment: initialConfig.notifications.notifyOnComment,
        enableRealtimeSse: initialConfig.notifications.enableRealtimeSse,
        updatedBy: initialConfig.updatedBy || "Khởi tạo hệ thống",
      },
    });

    currentSystemConfig = mapDbRecordToConfig(created);
    isDbLoaded = true;
    persistSystemConfigToDisk(currentSystemConfig);
    console.log("⚙️ [SYSTEM CONFIG] Đã khởi tạo bản ghi SystemSetting đầu tiên trong SQL Server Database.");
    return { ...currentSystemConfig };
  } catch (error) {
    console.error("⚠️ Lỗi khi nạp cấu hình từ bảng SystemSetting DB, dùng disk cache:", error);
    return { ...currentSystemConfig };
  }
}

// Kích hoạt nạp ngầm từ DB khi module khởi chạy
loadSystemConfigFromDb().catch(() => {});

/**
 * Lấy toàn bộ cấu hình hệ thống từ DB (kèm password thực tế dùng cho runtime)
 */
export async function getSystemConfigAsync(): Promise<SystemConfigData> {
  if (!isDbLoaded) {
    return loadSystemConfigFromDb();
  }
  return { ...currentSystemConfig };
}

/**
 * Lấy toàn bộ cấu hình hệ thống từ in-memory cache (đồng bộ)
 */
export function getSystemConfig(): SystemConfigData {
  return { ...currentSystemConfig };
}

/**
 * Lấy URL gốc (Base URL) của ứng dụng để gắn vào các liên kết trong email và thông báo
 */
export function getAppBaseUrl(): string {
  const url = currentSystemConfig.branding.appUrl || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return url.trim().replace(/\/+$/, "");
}

/**
 * Lấy cấu hình SMTP có hiệu lực (kết hợp cài đặt DB và biến môi trường)
 */
export function getEffectiveSmtpConfig(): SmtpConfig {
  const cfg = currentSystemConfig.smtp;
  return {
    host: cfg.host || process.env.SMTP_HOST || "",
    port: cfg.port || (process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587),
    user: cfg.user || process.env.SMTP_USER || "",
    pass: cfg.pass || process.env.SMTP_PASS || "",
    secure: cfg.secure || process.env.SMTP_SECURE === "true" || cfg.port === 465,
    from: cfg.from || process.env.SMTP_FROM || "no-reply@kztek.net",
    fromName: cfg.fromName || process.env.SMTP_FROM_NAME || "KZTEK Work Management",
  };
}

/**
 * Lấy cấu hình đã được che mật khẩu (bất đồng bộ, nạp từ DB cho UI Admin)
 */
export async function getMaskedSystemConfigAsync(): Promise<SystemConfigData> {
  const cfg = await getSystemConfigAsync();
  return {
    ...cfg,
    smtp: {
      ...cfg.smtp,
      pass: cfg.smtp.pass ? "••••••••••••" : "",
    },
  };
}

/**
 * Lấy cấu hình đã được che mật khẩu (đồng bộ)
 */
export function getMaskedSystemConfig(): SystemConfigData {
  const cfg = { ...currentSystemConfig };
  return {
    ...cfg,
    smtp: {
      ...cfg.smtp,
      pass: cfg.smtp.pass ? "••••••••••••" : "",
    },
  };
}

export type SystemConfigUpdateInput = {
  smtp?: Partial<SystemConfigData["smtp"]>;
  branding?: Partial<SystemBrandingConfig>;
  notifications?: Partial<SystemNotificationRules>;
};

/**
 * Cập nhật cấu hình hệ thống vào SQL Server Database và bộ nhớ đệm (Chỉ Admin)
 */
export async function updateSystemConfigAsync(
  updates: SystemConfigUpdateInput,
  updaterName: string = "Admin"
): Promise<SystemConfigData> {
  // Đảm bảo đã nạp dữ liệu hiện tại từ DB
  if (!isDbLoaded) {
    await loadSystemConfigFromDb();
  }

  const existingSmtp = currentSystemConfig.smtp;

  // Nếu mật khẩu truyền lên là dạng che "••••••••••••" hoặc rỗng -> giữ nguyên mật khẩu cũ
  let finalPass = updates.smtp?.pass;
  if (!finalPass || finalPass === "••••••••••••") {
    finalPass = existingSmtp.pass;
  }

  const newSmtp = {
    host: updates.smtp?.host !== undefined ? updates.smtp.host : existingSmtp.host,
    port: updates.smtp?.port !== undefined ? Number(updates.smtp.port) || 587 : existingSmtp.port,
    user: updates.smtp?.user !== undefined ? updates.smtp.user : existingSmtp.user,
    pass: finalPass,
    secure: updates.smtp?.secure !== undefined ? updates.smtp.secure : existingSmtp.secure,
    from: updates.smtp?.from !== undefined ? updates.smtp.from : existingSmtp.from,
    fromName: updates.smtp?.fromName !== undefined ? updates.smtp.fromName : existingSmtp.fromName,
  };

  const newBranding = {
    ...currentSystemConfig.branding,
    ...(updates.branding || {}),
  };

  const newNotifications = {
    ...currentSystemConfig.notifications,
    ...(updates.notifications || {}),
  };

  try {
    const savedSetting = await prisma.systemSetting.upsert({
      where: { id: "default" },
      update: {
        smtpHost: newSmtp.host,
        smtpPort: newSmtp.port,
        smtpUser: newSmtp.user,
        smtpPass: newSmtp.pass,
        smtpSecure: newSmtp.secure,
        smtpFrom: newSmtp.from,
        smtpFromName: newSmtp.fromName,
        systemName: newBranding.systemName,
        companyName: newBranding.companyName,
        hotline: newBranding.hotline,
        supportEmail: newBranding.supportEmail,
        website: newBranding.website,
        appUrl: newBranding.appUrl,
        notifyOnAssign: newNotifications.notifyOnAssign,
        notifyOnStatusChange: newNotifications.notifyOnStatusChange,
        notifyOnComment: newNotifications.notifyOnComment,
        enableRealtimeSse: newNotifications.enableRealtimeSse,
        updatedBy: updaterName,
      },
      create: {
        id: "default",
        smtpHost: newSmtp.host,
        smtpPort: newSmtp.port,
        smtpUser: newSmtp.user,
        smtpPass: newSmtp.pass,
        smtpSecure: newSmtp.secure,
        smtpFrom: newSmtp.from,
        smtpFromName: newSmtp.fromName,
        systemName: newBranding.systemName,
        companyName: newBranding.companyName,
        hotline: newBranding.hotline,
        supportEmail: newBranding.supportEmail,
        website: newBranding.website,
        appUrl: newBranding.appUrl,
        notifyOnAssign: newNotifications.notifyOnAssign,
        notifyOnStatusChange: newNotifications.notifyOnStatusChange,
        notifyOnComment: newNotifications.notifyOnComment,
        enableRealtimeSse: newNotifications.enableRealtimeSse,
        updatedBy: updaterName,
      },
    });

    currentSystemConfig = mapDbRecordToConfig(savedSetting);
    isDbLoaded = true;
  } catch (error) {
    console.error("⚠️ Lỗi khi lưu cấu hình vào SQL Server DB, fallback lưu disk cache:", error);
    currentSystemConfig = {
      smtp: newSmtp,
      branding: newBranding,
      notifications: newNotifications,
      updatedAt: new Date().toISOString(),
      updatedBy: updaterName,
    };
  }

  // Luôn đồng bộ backup ra disk
  persistSystemConfigToDisk(currentSystemConfig);

  console.log(`\n⚙️ [SYSTEM CONFIG PERSISTED IN DB] by ${updaterName} at ${currentSystemConfig.updatedAt} (App Base URL: ${getAppBaseUrl()})`);
  return getSystemConfig();
}

/**
 * Cập nhật cấu hình hệ thống (backward-compatible sync wrapper)
 */
export function updateSystemConfig(
  updates: SystemConfigUpdateInput,
  updaterName: string = "Admin"
): SystemConfigData {
  updateSystemConfigAsync(updates, updaterName).catch((err) => {
    console.error("Lỗi khi update async system config:", err);
  });
  return getSystemConfig();
}
