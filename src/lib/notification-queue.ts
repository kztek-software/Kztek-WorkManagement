import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/bus";
import { getAppBaseUrl, getSystemConfig } from "@/lib/system-config";
import {
  sendTaskAssignedEmail,
  sendStatusChangedEmail,
  sendTaskCommentEmail,
  sendTaskMentionEmail,
} from "@/lib/mail";
import { notifyUserViaZalo } from "@/lib/zalo/notify";
import { notifyUserViaDiscordDM, broadcastDiscordWebhook } from "@/lib/discord/notify";
import { getUserNotificationPreference, isChannelEnabledForEvent } from "@/lib/notification-preferences";

export type NotificationJob =
  | {
      type: "TASK_ASSIGNED";
      taskId: string;
      assigneeId: string;
      actorId: string;
      projectId: string;
    }
  | {
      type: "TASK_STATUS_CHANGED";
      taskId: string;
      actorId: string;
      oldStatus: string;
      newStatus: string;
      projectId: string;
    }
  | {
      type: "TASK_MENTION";
      taskId: string;
      authorId: string;
      commentBody: string;
      mentionedUserIds: string[];
      projectId: string;
    }
  | {
      type: "TASK_COMMENT";
      taskId: string;
      authorId: string;
      commentBody: string;
      projectId: string;
      excludeUserIds?: string[];
    }
  | {
      type: "CUSTOM_NOTIFICATION";
      userId: string;
      actorId?: string | null;
      notificationType: "ASSIGNED" | "STATUS_CHANGED" | "COMMENTED" | "MENTIONED" | "DUE_SOON" | "TICKET_CREATED" | "TICKET_UPDATED";
      title: string;
      message: string;
      link?: string | null;
      projectId?: string;
    };

/**
 * Hàng đợi Bất đồng bộ Đa tác vụ (Async Background Notification Queue)
 * Tách biệt hoàn toàn luồng xử lý thông báo & email khỏi vòng đời HTTP Request của người dùng,
 * đảm bảo API phản hồi tức thì (< 50ms) và giao diện tuyệt đối không bị giật lag/khựng.
 */
class NotificationQueue {
  private queue: NotificationJob[] = [];
  private isProcessing = false;
  private maxConcurrency = 3;
  private activeWorkers = 0;

  /**
   * Đẩy công việc vào hàng đợi (Thực thi tức thì 0ms, non-blocking)
   */
  public enqueue(job: NotificationJob): void {
    this.queue.push(job);
    this.scheduleProcessing();
  }

  /**
   * Đẩy nhiều công việc cùng lúc
   */
  public enqueueMany(jobs: NotificationJob[]): void {
    if (!jobs.length) return;
    this.queue.push(...jobs);
    this.scheduleProcessing();
  }

  /**
   * Lấy số lượng công việc còn lại trong hàng đợi
   */
  public getPendingCount(): number {
    return this.queue.length;
  }

  private scheduleProcessing(): void {
    // Sử dụng setImmediate để chuyển xử lý sang macro-task tiếp theo,
    // giải phóng hoàn toàn luồng Node.js event loop cho HTTP Response
    setImmediate(() => {
      this.drainQueue().catch((err) => {
        console.error("[NotificationQueue] Lỗi không xử lý được trong queue worker:", err);
      });
    });
  }

  private async drainQueue(): Promise<void> {
    if (this.isProcessing && this.activeWorkers >= this.maxConcurrency) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeWorkers < this.maxConcurrency) {
      const job = this.queue.shift();
      if (!job) break;

      this.activeWorkers++;

      // Xử lý song song từng job trong worker độc lập
      this.processJob(job)
        .catch((err) => {
          console.error(`[NotificationQueue] Lỗi khi xử lý job ${job.type}:`, err);
        })
        .finally(() => {
          this.activeWorkers--;
          if (this.queue.length > 0) {
            this.scheduleProcessing();
          } else if (this.activeWorkers === 0) {
            this.isProcessing = false;
          }
        });
    }

    if (this.activeWorkers === 0 && this.queue.length === 0) {
      this.isProcessing = false;
    }
  }

  private async processJob(job: NotificationJob): Promise<void> {
    switch (job.type) {
      case "TASK_ASSIGNED":
        await this.handleTaskAssigned(job);
        break;
      case "TASK_STATUS_CHANGED":
        await this.handleTaskStatusChanged(job);
        break;
      case "TASK_MENTION":
        await this.handleTaskMention(job);
        break;
      case "TASK_COMMENT":
        await this.handleTaskComment(job);
        break;
      case "CUSTOM_NOTIFICATION":
        await this.handleCustomNotification(job);
        break;
    }
  }

  // ==========================================
  // JOB HANDLERS: Xử lý ngầm từng loại nghiệp vụ
  // ==========================================

  private async handleTaskAssigned(job: {
    taskId: string;
    assigneeId: string;
    actorId: string;
    projectId: string;
  }): Promise<void> {
    if (!job.assigneeId) return;

    try {
      const [task, assignee, actor, project] = await Promise.all([
        prisma.task.findUnique({
          where: { id: job.taskId },
          select: {
            id: true,
            number: true,
            title: true,
            description: true,
            type: true,
            priority: true,
            dueDate: true,
          },
        }),
        prisma.user.findUnique({
          where: { id: job.assigneeId },
          select: { id: true, name: true, email: true, phone: true, zaloUserId: true, discordUserId: true },
        }),
        prisma.user.findUnique({
          where: { id: job.actorId },
          select: { id: true, name: true },
        }),
        prisma.project.findUnique({
          where: { id: job.projectId },
          select: { id: true, name: true, key: true },
        }),
      ]);

      if (!task || !assignee || !actor || !project) return;

      const taskCode = `${project.key}-${task.number}`;
      const directTaskUrl = `${getAppBaseUrl()}/projects/${project.id}/board?taskId=${task.id}`;
      const isSelf = assignee.id === actor.id;
      const notifyTitle = isSelf ? "Tự nhận việc" : "Giao việc mới";
      const notifyMessage = isSelf
        ? `Bạn đã tự nhận việc ${taskCode}: "${task.title}"`
        : `${actor.name} đã giao việc ${taskCode}: "${task.title}" cho bạn`;

      // Tùy chọn kênh nhận thông báo riêng của assignee (lớp lọc thứ 2 sau công tắc tổng SystemSetting)
      const systemCfg = getSystemConfig();
      const pref = await getUserNotificationPreference(assignee.id);

      // 1. Tạo In-App Notification (nếu user không tắt kênh in-app cho loại này)
      if (isChannelEnabledForEvent(pref, "inApp", "ASSIGNED")) {
        await prisma.notification.create({
          data: {
            userId: assignee.id,
            actorId: actor.id,
            type: "ASSIGNED",
            title: notifyTitle,
            message: notifyMessage,
            link: `/projects/${project.id}/board?taskId=${task.id}`,
          },
        });
      }

      // 2. Bắn Realtime SSE để đồng bộ Board — luôn bắn, không phụ thuộc tùy chọn thông báo cá nhân
      publish(job.projectId, {
        type: "TASK_CHANGED",
        taskId: job.taskId,
        actorId: job.actorId,
      });

      // 3. Gửi Email HTML qua SMTP — cần cả công tắc tổng hệ thống VÀ tùy chọn cá nhân đều bật
      if (systemCfg.notifications.notifyOnAssign && isChannelEnabledForEvent(pref, "email", "ASSIGNED")) {
        await sendTaskAssignedEmail({
          taskNumber: task.number,
          taskTitle: task.title,
          taskDescription: task.description,
          taskType: task.type,
          priority: task.priority,
          dueDate: task.dueDate ? task.dueDate.toISOString() : null,
          projectName: project.name,
          projectKey: project.key,
          projectId: project.id,
          taskId: task.id,
          assignorName: isSelf ? "Chính bạn" : actor.name,
          assigneeName: assignee.name,
          assigneeEmail: assignee.email,
          taskUrl: directTaskUrl,
        });
      }

      // 4. Gửi Zalo (OA/ZNS) — chỉ khi user không tắt kênh Zalo cho loại này (công tắc tổng được check trong notifyUserViaZalo)
      if (isChannelEnabledForEvent(pref, "zalo", "ASSIGNED")) {
        await notifyUserViaZalo(assignee, {
          type: "ASSIGNED",
          title: notifyTitle,
          message: notifyMessage,
        });
      }

      // 5. Gửi DM Discord cá nhân — chỉ khi user không tắt kênh Discord cho loại này
      if (isChannelEnabledForEvent(pref, "discord", "ASSIGNED")) {
        await notifyUserViaDiscordDM(assignee, {
          type: "ASSIGNED",
          title: notifyTitle,
          message: notifyMessage,
        });
      }

      // 6. Đăng vào kênh Discord chung qua Webhook — 1 lần cho cả sự kiện, không phụ thuộc tùy chọn cá nhân
      await broadcastDiscordWebhook({
        type: "ASSIGNED",
        title: notifyTitle,
        message: task.description ? task.description.slice(0, 300) : `Task **${taskCode}**: ${task.title}`,
        url: directTaskUrl,
        fields: [
          { name: "Dự án", value: `${project.name} (${project.key})`, inline: true },
          { name: "Công việc", value: `${taskCode} — ${task.title}`, inline: true },
          { name: "Người giao", value: isSelf ? "Tự nhận" : actor.name, inline: true },
          { name: "Người thực hiện", value: assignee.name, inline: true },
          { name: "Độ ưu tiên", value: task.priority, inline: true },
          ...(task.dueDate ? [{ name: "Hạn chót", value: task.dueDate.toLocaleDateString("vi-VN"), inline: true }] : []),
        ],
      });
    } catch (err) {
      console.error("[NotificationQueue] Lỗi trong handleTaskAssigned:", err);
    }
  }

  private async handleTaskStatusChanged(job: {
    taskId: string;
    actorId: string;
    oldStatus: string;
    newStatus: string;
    projectId: string;
  }): Promise<void> {
    try {
      const [task, actor, project] = await Promise.all([
        prisma.task.findUnique({
          where: { id: job.taskId },
          select: {
            id: true,
            number: true,
            title: true,
            assigneeId: true,
            creatorId: true,
            assignee: { select: { id: true, name: true, email: true, phone: true, zaloUserId: true, discordUserId: true } },
            creator: { select: { id: true, name: true, email: true, phone: true, zaloUserId: true, discordUserId: true } },
          },
        }),
        prisma.user.findUnique({
          where: { id: job.actorId },
          select: { id: true, name: true },
        }),
        prisma.project.findUnique({
          where: { id: job.projectId },
          select: { id: true, name: true, key: true },
        }),
      ]);

      if (!task || !actor || !project) return;

      const directTaskUrl = `${getAppBaseUrl()}/projects/${project.id}/board?taskId=${task.id}`;
      const recipientsToNotify = new Map<string, { id: string; name: string; email: string; phone: string | null; zaloUserId: string | null; discordUserId: string | null }>();

      if (task.assignee && task.assignee.id !== actor.id) {
        recipientsToNotify.set(task.assignee.id, task.assignee);
      }
      if (task.creator && task.creator.id !== actor.id) {
        recipientsToNotify.set(task.creator.id, task.creator);
      }

      const systemCfg = getSystemConfig();

      for (const recipient of recipientsToNotify.values()) {
        const pref = await getUserNotificationPreference(recipient.id);
        const notifyTitle = "Trạng thái công việc thay đổi";
        const notifyMessage = `${actor.name} đã chuyển ${project.key}-${task.number} sang ${job.newStatus}`;

        if (isChannelEnabledForEvent(pref, "inApp", "STATUS_CHANGED")) {
          await prisma.notification.create({
            data: {
              userId: recipient.id,
              actorId: actor.id,
              type: "STATUS_CHANGED",
              title: notifyTitle,
              message: notifyMessage,
              link: `/projects/${project.id}/board?taskId=${task.id}`,
            },
          });
        }

        if (systemCfg.notifications.notifyOnStatusChange && isChannelEnabledForEvent(pref, "email", "STATUS_CHANGED")) {
          await sendStatusChangedEmail({
            taskNumber: task.number,
            taskTitle: task.title,
            projectName: project.name,
            projectId: project.id,
            taskId: task.id,
            oldStatus: job.oldStatus,
            newStatus: job.newStatus,
            actorName: actor.name,
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            taskUrl: directTaskUrl,
          }).catch((err) => {
            console.error("[NotificationQueue] Lỗi khi gửi email đổi trạng thái:", err);
          });
        }

        if (isChannelEnabledForEvent(pref, "zalo", "STATUS_CHANGED")) {
          await notifyUserViaZalo(recipient, {
            type: "STATUS_CHANGED",
            title: notifyTitle,
            message: notifyMessage,
          });
        }

        if (isChannelEnabledForEvent(pref, "discord", "STATUS_CHANGED")) {
          await notifyUserViaDiscordDM(recipient, {
            type: "STATUS_CHANGED",
            title: notifyTitle,
            message: notifyMessage,
          });
        }
      }

      await broadcastDiscordWebhook({
        type: "STATUS_CHANGED",
        title: "Trạng thái công việc thay đổi",
        message: `**${task.title}**`,
        url: directTaskUrl,
        fields: [
          { name: "Dự án", value: `${project.name} (${project.key})`, inline: true },
          { name: "Công việc", value: `${project.key}-${task.number}`, inline: true },
          { name: "Người thực hiện", value: actor.name, inline: true },
          { name: "Trạng thái", value: `${job.oldStatus} → ${job.newStatus}`, inline: true },
        ],
      });

      publish(job.projectId, {
        type: "TASK_CHANGED",
        taskId: job.taskId,
        actorId: job.actorId,
      });
    } catch (err) {
      console.error("[NotificationQueue] Lỗi trong handleTaskStatusChanged:", err);
    }
  }

  private async handleTaskMention(job: {
    taskId: string;
    authorId: string;
    commentBody: string;
    mentionedUserIds: string[];
    projectId: string;
  }): Promise<void> {
    try {
      const uniqueRecipientIds = Array.from(
        new Set(job.mentionedUserIds.filter((id) => id && id !== job.authorId))
      );

      if (uniqueRecipientIds.length === 0) return;

      const [task, author, project, users] = await Promise.all([
        prisma.task.findUnique({
          where: { id: job.taskId },
          select: { id: true, number: true, title: true },
        }),
        prisma.user.findUnique({
          where: { id: job.authorId },
          select: { id: true, name: true },
        }),
        prisma.project.findUnique({
          where: { id: job.projectId },
          select: { id: true, name: true, key: true },
        }),
        prisma.user.findMany({
          where: { id: { in: uniqueRecipientIds } },
          select: { id: true, name: true, email: true, phone: true, zaloUserId: true, discordUserId: true },
        }),
      ]);

      if (!task || !author || !project || users.length === 0) return;

      const taskCode = `${project.key}-${task.number}`;
      const directTaskUrl = `${getAppBaseUrl()}/projects/${project.id}/board?taskId=${task.id}`;
      const systemCfg = getSystemConfig();

      for (const recipient of users) {
        const pref = await getUserNotificationPreference(recipient.id);
        const notifyTitle = `Được nhắc đến trong ${taskCode}`;
        const notifyMessage = `${author.name} đã nhắc đến bạn trong bình luận công việc ${taskCode}: "${job.commentBody.slice(0, 90)}"`;

        if (isChannelEnabledForEvent(pref, "inApp", "MENTIONED")) {
          await prisma.notification.create({
            data: {
              userId: recipient.id,
              actorId: author.id,
              type: "MENTIONED",
              title: notifyTitle,
              message: notifyMessage,
              link: `/projects/${project.id}/board?taskId=${task.id}`,
            },
          });
        }

        // Chưa có công tắc tổng riêng cho "mention" ở SystemSetting -> dùng chung công tắc "Bình luận"
        if (systemCfg.notifications.notifyOnComment && isChannelEnabledForEvent(pref, "email", "MENTIONED")) {
          await sendTaskMentionEmail({
            taskNumber: task.number,
            taskTitle: task.title,
            projectName: project.name,
            projectKey: project.key,
            projectId: project.id,
            taskId: task.id,
            authorName: author.name,
            commentBody: job.commentBody,
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            taskUrl: directTaskUrl,
          }).catch((err) => {
            console.error("[NotificationQueue] Lỗi khi gửi email tag mention:", err);
          });
        }

        if (isChannelEnabledForEvent(pref, "zalo", "MENTIONED")) {
          await notifyUserViaZalo(recipient, {
            type: "MENTIONED",
            title: notifyTitle,
            message: notifyMessage,
          });
        }

        // Mention là thông báo riêng cho 1 người -> chỉ gửi DM Discord, KHÔNG đăng vào kênh chung (tránh nhiễu)
        if (isChannelEnabledForEvent(pref, "discord", "MENTIONED")) {
          await notifyUserViaDiscordDM(recipient, {
            type: "MENTIONED",
            title: notifyTitle,
            message: notifyMessage,
          });
        }
      }

      publish(job.projectId, {
        type: "TASK_CHANGED",
        taskId: job.taskId,
        actorId: job.authorId,
      });
    } catch (err) {
      console.error("[NotificationQueue] Lỗi trong handleTaskMention:", err);
    }
  }

  private async handleTaskComment(job: {
    taskId: string;
    authorId: string;
    commentBody: string;
    projectId: string;
    excludeUserIds?: string[];
  }): Promise<void> {
    try {
      const [task, author, project] = await Promise.all([
        prisma.task.findUnique({
          where: { id: job.taskId },
          select: {
            id: true,
            number: true,
            title: true,
            assignee: { select: { id: true, name: true, email: true, phone: true, zaloUserId: true, discordUserId: true } },
            creator: { select: { id: true, name: true, email: true, phone: true, zaloUserId: true, discordUserId: true } },
          },
        }),
        prisma.user.findUnique({
          where: { id: job.authorId },
          select: { id: true, name: true },
        }),
        prisma.project.findUnique({
          where: { id: job.projectId },
          select: { id: true, name: true, key: true },
        }),
      ]);

      if (!task || !author || !project) return;

      const directTaskUrl = `${getAppBaseUrl()}/projects/${project.id}/board?taskId=${task.id}`;
      const excludeSet = new Set(job.excludeUserIds || []);
      const recipients = new Map<string, { id: string; name: string; email: string; phone: string | null; zaloUserId: string | null; discordUserId: string | null }>();

      if (task.assignee && task.assignee.id !== author.id && !excludeSet.has(task.assignee.id)) {
        recipients.set(task.assignee.id, task.assignee);
      }
      if (task.creator && task.creator.id !== author.id && !excludeSet.has(task.creator.id)) {
        recipients.set(task.creator.id, task.creator);
      }

      const systemCfg = getSystemConfig();

      for (const recipient of recipients.values()) {
        const pref = await getUserNotificationPreference(recipient.id);
        const notifyTitle = "Bình luận mới trong công việc";
        const notifyMessage = `${author.name} đã bình luận trong task ${project.key}-${task.number}`;

        if (isChannelEnabledForEvent(pref, "inApp", "COMMENTED")) {
          await prisma.notification.create({
            data: {
              userId: recipient.id,
              actorId: author.id,
              type: "COMMENTED",
              title: notifyTitle,
              message: notifyMessage,
              link: `/projects/${project.id}/board?taskId=${task.id}`,
            },
          });
        }

        if (systemCfg.notifications.notifyOnComment && isChannelEnabledForEvent(pref, "email", "COMMENTED")) {
          await sendTaskCommentEmail({
            taskNumber: task.number,
            taskTitle: task.title,
            projectName: project.name,
            projectId: project.id,
            taskId: task.id,
            authorName: author.name,
            commentBody: job.commentBody,
            recipientName: recipient.name,
            recipientEmail: recipient.email,
            taskUrl: directTaskUrl,
          }).catch((err) => {
            console.error("[NotificationQueue] Lỗi khi gửi email bình luận:", err);
          });
        }

        if (isChannelEnabledForEvent(pref, "zalo", "COMMENTED")) {
          await notifyUserViaZalo(recipient, {
            type: "COMMENTED",
            title: notifyTitle,
            message: notifyMessage,
          });
        }

        if (isChannelEnabledForEvent(pref, "discord", "COMMENTED")) {
          await notifyUserViaDiscordDM(recipient, {
            type: "COMMENTED",
            title: notifyTitle,
            message: notifyMessage,
          });
        }
      }

      await broadcastDiscordWebhook({
        type: "COMMENTED",
        title: "Bình luận mới trong công việc",
        message: job.commentBody.slice(0, 300),
        url: directTaskUrl,
        fields: [
          { name: "Dự án", value: `${project.name} (${project.key})`, inline: true },
          { name: "Công việc", value: `${project.key}-${task.number} — ${task.title}`, inline: true },
          { name: "Người bình luận", value: author.name, inline: true },
        ],
      });
    } catch (err) {
      console.error("[NotificationQueue] Lỗi trong handleTaskComment:", err);
    }
  }

  private async handleCustomNotification(job: {
    userId: string;
    actorId?: string | null;
    notificationType: "ASSIGNED" | "STATUS_CHANGED" | "COMMENTED" | "MENTIONED" | "DUE_SOON" | "TICKET_CREATED" | "TICKET_UPDATED";
    title: string;
    message: string;
    link?: string | null;
    projectId?: string;
  }): Promise<void> {
    try {
      if (job.actorId && job.userId === job.actorId) return;

      await prisma.notification.create({
        data: {
          userId: job.userId,
          actorId: job.actorId,
          type: job.notificationType,
          title: job.title,
          message: job.message,
          link: job.link,
        },
      });

      if (job.projectId) {
        publish(job.projectId, {
          type: "TASK_CHANGED",
          taskId: "notification",
          actorId: job.actorId ?? "system",
        });
      }
    } catch (err) {
      console.error("[NotificationQueue] Lỗi trong handleCustomNotification:", err);
    }
  }
}

// Khởi tạo Singleton duy nhất trên môi trường Node.js
const globalForQueue = globalThis as unknown as {
  __kztek_notification_queue__?: NotificationQueue;
};

export const notificationQueue =
  globalForQueue.__kztek_notification_queue__ ?? new NotificationQueue();

if (process.env.NODE_ENV !== "production") {
  globalForQueue.__kztek_notification_queue__ = notificationQueue;
}