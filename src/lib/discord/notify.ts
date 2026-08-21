import { prisma } from "@/lib/prisma";
import { getEffectiveDiscordConfig } from "@/lib/system-config";
import { sendDiscordDM, sendDiscordWebhookEmbed, DiscordApiError, type DiscordEmbed } from "@/lib/discord/client";

export type DiscordNotifyType = "ASSIGNED" | "STATUS_CHANGED" | "COMMENTED" | "MENTIONED" | "TEST";

type Recipient = {
  id: string;
  discordUserId?: string | null;
};

type EmbedField = { name: string; value: string; inline?: boolean };

const DM_FLAG_MAP: Record<Exclude<DiscordNotifyType, "TEST">, "notifyOnAssign" | "notifyOnStatusChange" | "notifyOnComment"> = {
  ASSIGNED: "notifyOnAssign",
  STATUS_CHANGED: "notifyOnStatusChange",
  COMMENTED: "notifyOnComment",
  MENTIONED: "notifyOnComment",
};

const WEBHOOK_FLAG_MAP: Record<Exclude<DiscordNotifyType, "TEST">, "webhookOnAssign" | "webhookOnStatusChange" | "webhookOnComment"> = {
  ASSIGNED: "webhookOnAssign",
  STATUS_CHANGED: "webhookOnStatusChange",
  COMMENTED: "webhookOnComment",
  MENTIONED: "webhookOnComment",
};

// Màu embed theo brand KZTEK (Navy #251C53 / Cam #F05922), phân theo loại sự kiện để dễ nhận diện nhanh
const EMBED_COLOR: Record<DiscordNotifyType, number> = {
  ASSIGNED: 0xf05922, // Cam — việc mới cần chú ý
  STATUS_CHANGED: 0x4a3f8c, // Navy nhạt
  COMMENTED: 0x251c53, // Navy đậm
  MENTIONED: 0xffaa80, // Cam nhạt
  TEST: 0xcbcbcb, // Xám
};

const EMBED_ICON: Record<DiscordNotifyType, string> = {
  ASSIGNED: "📌",
  STATUS_CHANGED: "🔄",
  COMMENTED: "💬",
  MENTIONED: "📣",
  TEST: "🧪",
};

/**
 * Gửi DM Discord cá nhân cho 1 user đã tự liên kết tài khoản Discord.
 * Không throw ra ngoài — mọi lỗi được log vào DiscordMessageLog để Admin tra soát.
 */
export async function notifyUserViaDiscordDM(
  recipient: Recipient,
  params: { type: DiscordNotifyType; title: string; message: string }
): Promise<void> {
  try {
    const cfg = getEffectiveDiscordConfig();
    if (!cfg.enabled || !cfg.botToken || !recipient.discordUserId) return;

    if (params.type !== "TEST") {
      const flagKey = DM_FLAG_MAP[params.type];
      if (!cfg[flagKey]) return;
    }

    const content = `**${EMBED_ICON[params.type]} ${params.title}**\n${params.message}`;

    const log = await prisma.discordMessageLog.create({
      data: {
        userId: recipient.id,
        discordUserId: recipient.discordUserId,
        channel: "DM",
        notificationType: params.type,
        content,
        status: "PENDING",
      },
    });

    try {
      const result = await sendDiscordDM(recipient.discordUserId, content);
      await prisma.discordMessageLog.update({
        where: { id: log.id },
        data: { status: "SENT", sentAt: new Date(), providerMsgId: result.messageId },
      });
    } catch (err) {
      const errMessage = err instanceof DiscordApiError ? err.message : String(err);
      console.error(`[Discord] Gửi DM thất bại cho user ${recipient.id}:`, errMessage);
      await prisma.discordMessageLog.update({
        where: { id: log.id },
        data: { status: "FAILED", errorMessage: errMessage },
      });
    }
  } catch (err) {
    console.error("[Discord] Lỗi không mong đợi trong notifyUserViaDiscordDM:", err);
  }
}

/**
 * Đăng 1 Embed chi tiết (khung màu theo loại sự kiện, tiêu đề bấm được ra thẳng task, các trường
 * thông tin rõ ràng: dự án, task, người thực hiện...) vào kênh Discord chung qua Webhook —
 * KHÔNG gắn với 1 user cụ thể, mọi thành viên server đều thấy chung (không có tùy chọn cá nhân riêng).
 */
export async function broadcastDiscordWebhook(params: {
  type: DiscordNotifyType;
  title: string;
  message: string;
  url?: string;
  fields?: EmbedField[];
}): Promise<void> {
  try {
    const cfg = getEffectiveDiscordConfig();
    if (!cfg.enabled || !cfg.webhookUrl) return;

    if (params.type !== "TEST") {
      const flagKey = WEBHOOK_FLAG_MAP[params.type];
      if (!cfg[flagKey]) return;
    }

    const embed: DiscordEmbed = {
      title: `${EMBED_ICON[params.type]} ${params.title}`,
      description: params.message,
      url: params.url,
      color: EMBED_COLOR[params.type],
      fields: params.fields,
      footer: { text: "KZTEK Work Management" },
      timestamp: new Date().toISOString(),
    };

    const log = await prisma.discordMessageLog.create({
      data: {
        userId: null,
        channel: "WEBHOOK",
        notificationType: params.type,
        content: JSON.stringify(embed),
        status: "PENDING",
      },
    });

    try {
      await sendDiscordWebhookEmbed(embed);
      await prisma.discordMessageLog.update({
        where: { id: log.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (err) {
      const errMessage = err instanceof DiscordApiError ? err.message : String(err);
      console.error("[Discord] Đăng Webhook thất bại:", errMessage);
      await prisma.discordMessageLog.update({
        where: { id: log.id },
        data: { status: "FAILED", errorMessage: errMessage },
      });
    }
  } catch (err) {
    console.error("[Discord] Lỗi không mong đợi trong broadcastDiscordWebhook:", err);
  }
}
