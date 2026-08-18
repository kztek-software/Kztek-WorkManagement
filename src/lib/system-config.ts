import type { SmtpConfig } from "@/lib/mail";

export type SystemBrandingConfig = {
  systemName: string;
  companyName: string;
  hotline: string;
  supportEmail: string;
  website: string;
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

// In-memory system configuration storage initialized with sensible defaults / environment variables
let currentSystemConfig: SystemConfigData = {
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

/**
 * Lấy toàn bộ cấu hình hệ thống (kèm password thực tế dùng cho runtime)
 */
export function getSystemConfig(): SystemConfigData {
  return { ...currentSystemConfig };
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

  console.log(`\n⚙️ [SYSTEM CONFIG UPDATED] by ${updaterName} at ${currentSystemConfig.updatedAt}`);
  return getMaskedSystemConfig();
}
