import fs from "node:fs";
import path from "node:path";
import type { SmtpConfig } from "@/lib/mail";

// Cấu hình hệ thống được ghi xuống file JSON trên đĩa để không bị mất khi
// server restart / hot-reload (trước đây chỉ lưu trong biến bộ nhớ nên mỗi
// lần reload server là mất toàn bộ cấu hình đã lưu).
// KHÔNG đặt trong /public vì file này chứa mật khẩu SMTP.
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

// Cấu hình mặc định lấy từ biến môi trường, dùng khi chưa có file cấu hình đã lưu
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

// Đọc cấu hình đã lưu từ đĩa (nếu tồn tại) và merge đè lên mặc định, để các
// trường mới thêm sau này (nếu có) vẫn có giá trị fallback hợp lệ.
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

// Ghi cấu hình hiện tại xuống đĩa để không bị mất khi server restart / hot-reload
function persistSystemConfigToDisk(config: SystemConfigData): void {
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("⚠️ Không ghi được file cấu hình hệ thống xuống đĩa:", error);
  }
}

// In-memory cache, được nạp từ file trên đĩa (nếu có) khi module khởi động
let currentSystemConfig: SystemConfigData = loadSystemConfigFromDisk();

/**
 * Lấy toàn bộ cấu hình hệ thống (kèm password thực tế dùng cho runtime)
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
 * Lấy cấu hình SMTP có hiệu lực (kết hợp cài đặt giao diện và biến môi trường)
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
 * Lấy cấu hình đã được che mật khẩu (dùng trả về cho UI Admin)
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
 * Cập nhật cấu hình hệ thống (Chỉ Admin)
 */
export function updateSystemConfig(
  updates: SystemConfigUpdateInput,
  updaterName: string = "Admin"
): SystemConfigData {
  const existingSmtp = currentSystemConfig.smtp;

  // Nếu mật khẩu truyền lên là dạng che "••••••••••••" hoặc rỗng -> giữ nguyên mật khẩu cũ
  let finalPass = updates.smtp?.pass;
  if (!finalPass || finalPass === "••••••••••••") {
    finalPass = existingSmtp.pass;
  }

  currentSystemConfig = {
    smtp: {
      host: updates.smtp?.host ?? existingSmtp.host,
      port: Number(updates.smtp?.port) || existingSmtp.port,
      user: updates.smtp?.user ?? existingSmtp.user,
      pass: finalPass,
      secure: updates.smtp?.secure ?? existingSmtp.secure,
      from: updates.smtp?.from ?? existingSmtp.from,
      fromName: updates.smtp?.fromName ?? existingSmtp.fromName,
    },
    branding: {
      ...currentSystemConfig.branding,
      ...(updates.branding || {}),
    },
    notifications: {
      ...currentSystemConfig.notifications,
      ...(updates.notifications || {}),
    },
    updatedAt: new Date().toISOString(),
    updatedBy: updaterName,
  };

  persistSystemConfigToDisk(currentSystemConfig);

  console.log(`\n⚙️ [SYSTEM CONFIG UPDATED] by ${updaterName} at ${currentSystemConfig.updatedAt} (App Base URL: ${getAppBaseUrl()})`);
  return getMaskedSystemConfig();
}
