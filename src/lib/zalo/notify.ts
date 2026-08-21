import { prisma } from "@/lib/prisma";
import { getEffectiveZaloConfig } from "@/lib/system-config";
import { sendOaTextMessage, sendZnsTemplateMessage, ZaloApiError } from "@/lib/zalo/client";

export type ZaloNotifyType = "ASSIGNED" | "STATUS_CHANGED" | "COMMENTED" | "MENTIONED" | "TEST";

type Recipient = {
  id: string;
  name: string;
  phone?: string | null;
  zaloUserId?: string | null;
};

const TYPE_FLAG_MAP: Record<Exclude<ZaloNotifyType, "TEST">, "notifyOnAssign" | "notifyOnStatusChange" | "notifyOnComment"> = {
  ASSIGNED: "notifyOnAssign",
  STATUS_CHANGED: "notifyOnStatusChange",
  COMMENTED: "notifyOnComment",
  MENTIONED: "notifyOnComment",
};

/**
 * Gửi thông báo qua Zalo cho 1 user (song song với email/in-app hiện có), theo thứ tự ưu tiên:
 * 1. Nếu user đã tự liên kết Zalo (zaloUserId) -> gửi tin OA (miễn phí, cần đã tương tác OA trong 7 ngày).
 * 2. Nếu không, nếu Admin đã nhập số điện thoại (phone) và đã cấu hình ZNS Template -> gửi ZNS (tính phí).
 * 3. Nếu không có cách nào khả dụng -> bỏ qua, không log.
 *
 * Không throw ra ngoài — mọi lỗi được log vào bảng ZaloMessageLog để Admin tra soát,
 * tương tự cách các hàm sendXEmail() trong lib/mail.ts không làm fail luồng nghiệp vụ chính.
 */
export async function notifyUserViaZalo(
  recipient: Recipient,
  params: { type: ZaloNotifyType; title: string; message: string }
): Promise<void> {
  try {
    const cfg = getEffectiveZaloConfig();
    if (!cfg.enabled || !cfg.accessToken) return;

    if (params.type !== "TEST") {
      const flagKey = TYPE_FLAG_MAP[params.type];
      if (!cfg[flagKey]) return;
    }

    const text = `${params.title}\n${params.message}`;

    if (recipient.zaloUserId) {
      await sendAndLogOa(recipient, params.type, text);
      return;
    }

    if (recipient.phone && cfg.znsTemplateId) {
      await sendAndLogZns(recipient, params.type, cfg.znsTemplateId, params.title, params.message);
      return;
    }
    // Không có kênh Zalo khả dụng cho user này (chưa liên kết + chưa có SĐT) -> im lặng bỏ qua
  } catch (err) {
    console.error("[Zalo] Lỗi không mong đợi trong notifyUserViaZalo:", err);
  }
}

async function sendAndLogOa(recipient: Recipient, type: ZaloNotifyType, text: string): Promise<void> {
  const log = await prisma.zaloMessageLog.create({
    data: {
      userId: recipient.id,
      zaloUserId: recipient.zaloUserId,
      channel: "OA",
      notificationType: type,
      content: text,
      status: "PENDING",
    },
  });

  try {
    const result = await sendOaTextMessage(recipient.zaloUserId!, text);
    await prisma.zaloMessageLog.update({
      where: { id: log.id },
      data: { status: "SENT", sentAt: new Date(), providerMsgId: result.msgId },
    });
  } catch (err) {
    const message = err instanceof ZaloApiError ? err.message : String(err);
    console.error(`[Zalo] Gửi OA thất bại cho user ${recipient.id}:`, message);
    await prisma.zaloMessageLog.update({
      where: { id: log.id },
      data: { status: "FAILED", errorMessage: message },
    });
  }
}

async function sendAndLogZns(
  recipient: Recipient,
  type: ZaloNotifyType,
  templateId: string,
  title: string,
  message: string
): Promise<void> {
  const log = await prisma.zaloMessageLog.create({
    data: {
      userId: recipient.id,
      phone: recipient.phone,
      channel: "ZNS",
      notificationType: type,
      templateId,
      content: `${title}\n${message}`,
      status: "PENDING",
    },
  });

  try {
    // ⚠️ Các key "title"/"content" dưới đây là ví dụ — PHẢI khớp đúng tên biến (placeholder)
    // đã khai báo khi tạo Template ZNS thật trên Zalo Business Manager, nếu không API sẽ trả lỗi.
    const result = await sendZnsTemplateMessage({
      phone: recipient.phone!,
      templateId,
      templateData: { title, content: message },
      trackingId: log.id,
    });
    await prisma.zaloMessageLog.update({
      where: { id: log.id },
      data: { status: "SENT", sentAt: new Date(), providerMsgId: result.msgId },
    });
  } catch (err) {
    const message2 = err instanceof ZaloApiError ? err.message : String(err);
    console.error(`[Zalo] Gửi ZNS thất bại cho user ${recipient.id}:`, message2);
    await prisma.zaloMessageLog.update({
      where: { id: log.id },
      data: { status: "FAILED", errorMessage: message2 },
    });
  }
}
