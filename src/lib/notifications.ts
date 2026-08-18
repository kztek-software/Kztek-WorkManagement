import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/bus";

export type NotificationType = "ASSIGNED" | "STATUS_CHANGED" | "COMMENTED" | "DUE_SOON";

export type CreateNotificationParams = {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  projectId?: string;
};

export async function sendNotification(params: CreateNotificationParams) {
  try {
    // Không gửi thông báo cho chính mình nếu tự giao/tự comment
    if (params.actorId && params.userId === params.actorId) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        actorId: params.actorId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link,
      },
      include: {
        actor: { select: { id: true, name: true, avatarColor: true } },
      },
    });

    // Bắn realtime SSE nếu có projectId
    if (params.projectId) {
      publish(params.projectId, {
        type: "TASK_CHANGED",
        taskId: "notification",
        actorId: params.actorId ?? "system",
      });
    }

    // Mô phỏng / Gửi Email thông báo giao việc
    await dispatchEmailLog({
      toUserId: params.userId,
      subject: `[KZTEK Work] ${params.title}`,
      body: params.message,
      link: params.link,
    });

    return notification;
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
    return null;
  }
}

export async function dispatchEmailLog({
  toUserId,
  subject,
  body,
  link,
}: {
  toUserId: string;
  subject: string;
  body: string;
  link?: string | null;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { email: true, name: true },
    });
    if (!user) return;

    // Log chi tiết email giao việc
    console.log(`\n📧 [EMAIL DISPATCHED]`);
    console.log(`   To: ${user.name} <${user.email}>`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Content: ${body}`);
    if (link) console.log(`   Direct Link: http://localhost:3000${link}`);
    console.log(`   Timestamp: ${new Date().toISOString()}\n`);
  } catch (err) {
    console.error("Lỗi gửi email:", err);
  }
}
