import { prisma } from "@/lib/prisma";
import { publish } from "@/lib/bus";
import { getAppBaseUrl } from "@/lib/system-config";
import {
  sendTaskAssignedEmail,
  sendStatusChangedEmail,
  sendTaskCommentEmail,
  sendTaskMentionEmail,
  sendMail,
} from "@/lib/mail";

export type NotificationType = "ASSIGNED" | "STATUS_CHANGED" | "COMMENTED" | "MENTIONED" | "DUE_SOON" | "TICKET_CREATED" | "TICKET_UPDATED";

export type CreateNotificationParams = {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  projectId?: string;
};

/**
 * Gửi thông báo chung: Lưu DB + Realtime SSE + Log Email cơ bản
 */
export async function sendNotification(params: CreateNotificationParams) {
  try {
    // Không gửi thông báo cho chính mình nếu tự thao tác
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

    return notification;
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
    return null;
  }
}

/**
 * Kích hoạt thông báo chuyên biệt khi GIAO VIỆC (Task Assigned)
 * Gồm: DB In-App Notification + SSE Event + Branded HTML Email
 */
export async function notifyTaskAssigned(params: {
  taskId: string;
  assigneeId: string;
  actorId: string;
  projectId: string;
}) {
  try {
    if (!params.assigneeId || params.assigneeId === params.actorId) {
      return;
    }

    // Lấy thông tin chi tiết của task, assignee, actor và project
    const [task, assignee, actor, project] = await Promise.all([
      prisma.task.findUnique({
        where: { id: params.taskId },
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
        where: { id: params.assigneeId },
        select: { id: true, name: true, email: true },
      }),
      prisma.user.findUnique({
        where: { id: params.actorId },
        select: { id: true, name: true },
      }),
      prisma.project.findUnique({
        where: { id: params.projectId },
        select: { id: true, name: true, key: true },
      }),
    ]);

    if (!task || !assignee || !actor || !project) {
      return;
    }

    const taskCode = `${project.key}-${task.number}`;
    const directTaskUrl = `${getAppBaseUrl()}/projects/${project.id}/board?taskId=${task.id}`;

    // 1. Tạo In-App Notification trong Database
    await prisma.notification.create({
      data: {
        userId: assignee.id,
        actorId: actor.id,
        type: "ASSIGNED",
        title: "Giao việc mới",
        message: `${actor.name} đã giao việc ${taskCode}: "${task.title}" cho bạn`,
        link: `/projects/${project.id}/board?taskId=${task.id}`,
      },
    });

    // 2. Bắn Realtime SSE Event
    publish(params.projectId, {
      type: "TASK_CHANGED",
      taskId: params.taskId,
      actorId: params.actorId,
    });

    // 3. Gửi Branded HTML Email cho người nhận (bất đồng bộ)
    sendTaskAssignedEmail({
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
      assignorName: actor.name,
      assigneeName: assignee.name,
      assigneeEmail: assignee.email,
      taskUrl: directTaskUrl,
    }).catch((err) => {
      console.error("Lỗi khi gửi email giao việc:", err);
    });
  } catch (error) {
    console.error("Lỗi trong notifyTaskAssigned:", error);
  }
}

/**
 * Kích hoạt thông báo khi THAY ĐỔI TRẠNG THÁI (Status Changed)
 */
export async function notifyTaskStatusChanged(params: {
  taskId: string;
  actorId: string;
  oldStatus: string;
  newStatus: string;
  projectId: string;
}) {
  try {
    const [task, actor, project] = await Promise.all([
      prisma.task.findUnique({
        where: { id: params.taskId },
        select: {
          id: true,
          number: true,
          title: true,
          assigneeId: true,
          creatorId: true,
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: params.actorId },
        select: { id: true, name: true },
      }),
      prisma.project.findUnique({
        where: { id: params.projectId },
        select: { id: true, name: true, key: true },
      }),
    ]);

    if (!task || !actor || !project) return;

    const directTaskUrl = `${getAppBaseUrl()}/projects/${project.id}/board?taskId=${task.id}`;

    // Danh sách người cần nhận thông báo: Assignee và Creator (loại trừ chính người vừa đổi trạng thái)
    const recipientsToNotify = new Map<string, { id: string; name: string; email: string }>();

    if (task.assignee && task.assignee.id !== actor.id) {
      recipientsToNotify.set(task.assignee.id, task.assignee);
    }
    if (task.creator && task.creator.id !== actor.id) {
      recipientsToNotify.set(task.creator.id, task.creator);
    }

    for (const recipient of recipientsToNotify.values()) {
      // Lưu Notification DB
      await prisma.notification.create({
        data: {
          userId: recipient.id,
          actorId: actor.id,
          type: "STATUS_CHANGED",
          title: "Trạng thái công việc thay đổi",
          message: `${actor.name} đã chuyển ${project.key}-${task.number} sang ${params.newStatus}`,
          link: `/projects/${project.id}/board?taskId=${task.id}`,
        },
      });

      // Gửi Email
      sendStatusChangedEmail({
        taskNumber: task.number,
        taskTitle: task.title,
        projectName: project.name,
        projectId: project.id,
        taskId: task.id,
        oldStatus: params.oldStatus,
        newStatus: params.newStatus,
        actorName: actor.name,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        taskUrl: directTaskUrl,
      }).catch((err) => {
        console.error("Lỗi khi gửi email đổi trạng thái:", err);
      });
    }

    // Bắn realtime SSE
    publish(params.projectId, {
      type: "TASK_CHANGED",
      taskId: params.taskId,
      actorId: params.actorId,
    });
  } catch (error) {
    console.error("Lỗi trong notifyTaskStatusChanged:", error);
  }
}

/**
 * Kích hoạt thông báo chuyên biệt khi GẮN THẺ / TAG (@mention)
 * Gồm: DB In-App Notification (type: MENTIONED) + SSE Event + Branded HTML Email
 */
export async function notifyTaskMention(params: {
  taskId: string;
  authorId: string;
  commentBody: string;
  mentionedUserIds: string[];
  projectId: string;
}): Promise<string[]> {
  try {
    if (!params.mentionedUserIds || params.mentionedUserIds.length === 0) {
      return [];
    }

    // Lọc bỏ chính người viết comment nếu tự tag mình
    const uniqueRecipientIds = Array.from(
      new Set(params.mentionedUserIds.filter((id) => id && id !== params.authorId))
    );

    if (uniqueRecipientIds.length === 0) return [];

    const [task, author, project, users] = await Promise.all([
      prisma.task.findUnique({
        where: { id: params.taskId },
        select: { id: true, number: true, title: true },
      }),
      prisma.user.findUnique({
        where: { id: params.authorId },
        select: { id: true, name: true },
      }),
      prisma.project.findUnique({
        where: { id: params.projectId },
        select: { id: true, name: true, key: true },
      }),
      prisma.user.findMany({
        where: { id: { in: uniqueRecipientIds } },
        select: { id: true, name: true, email: true },
      }),
    ]);

    if (!task || !author || !project || users.length === 0) return [];

    const taskCode = `${project.key}-${task.number}`;
    const notifiedUserIds: string[] = [];

    const directTaskUrl = `${getAppBaseUrl()}/projects/${project.id}/board?taskId=${task.id}`;

    for (const recipient of users) {
      notifiedUserIds.push(recipient.id);

      // 1. Tạo In-App Notification DB
      await prisma.notification.create({
        data: {
          userId: recipient.id,
          actorId: author.id,
          type: "MENTIONED",
          title: `Được nhắc đến trong ${taskCode}`,
          message: `${author.name} đã nhắc đến bạn trong bình luận công việc ${taskCode}: "${params.commentBody.slice(0, 90)}"`,
          link: `/projects/${project.id}/board?taskId=${task.id}`,
        },
      });

      // 2. Gửi Email HTML Branded KZTEK
      sendTaskMentionEmail({
        taskNumber: task.number,
        taskTitle: task.title,
        projectName: project.name,
        projectKey: project.key,
        projectId: project.id,
        taskId: task.id,
        authorName: author.name,
        commentBody: params.commentBody,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        taskUrl: directTaskUrl,
      }).catch((err) => {
        console.error("Lỗi khi gửi email tag mention:", err);
      });
    }

    // 3. Bắn realtime SSE
    publish(params.projectId, {
      type: "TASK_CHANGED",
      taskId: params.taskId,
      actorId: params.authorId,
    });

    return notifiedUserIds;
  } catch (error) {
    console.error("Lỗi trong notifyTaskMention:", error);
    return [];
  }
}

/**
 * Kích hoạt thông báo khi CÓ BÌNH LUẬN MỚI (Task Comment)
 */
export async function notifyTaskComment(params: {
  taskId: string;
  authorId: string;
  commentBody: string;
  projectId: string;
  excludeUserIds?: string[];
}) {
  try {
    const [task, author, project] = await Promise.all([
      prisma.task.findUnique({
        where: { id: params.taskId },
        select: {
          id: true,
          number: true,
          title: true,
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: params.authorId },
        select: { id: true, name: true },
      }),
      prisma.project.findUnique({
        where: { id: params.projectId },
        select: { id: true, name: true, key: true },
      }),
    ]);

    if (!task || !author || !project) return;

    const directTaskUrl = `${getAppBaseUrl()}/projects/${project.id}/board?taskId=${task.id}`;
    const excludeSet = new Set(params.excludeUserIds || []);
    const recipients = new Map<string, { id: string; name: string; email: string }>();

    if (task.assignee && task.assignee.id !== author.id && !excludeSet.has(task.assignee.id)) {
      recipients.set(task.assignee.id, task.assignee);
    }
    if (task.creator && task.creator.id !== author.id && !excludeSet.has(task.creator.id)) {
      recipients.set(task.creator.id, task.creator);
    }

    for (const recipient of recipients.values()) {
      // In-app Notification
      await prisma.notification.create({
        data: {
          userId: recipient.id,
          actorId: author.id,
          type: "COMMENTED",
          title: "Bình luận mới trong công việc",
          message: `${author.name} đã bình luận trong task ${project.key}-${task.number}`,
          link: `/projects/${project.id}/board?taskId=${task.id}`,
        },
      });

      // Email
      sendTaskCommentEmail({
        taskNumber: task.number,
        taskTitle: task.title,
        projectName: project.name,
        projectId: project.id,
        taskId: task.id,
        authorName: author.name,
        commentBody: params.commentBody,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        taskUrl: directTaskUrl,
      }).catch((err) => {
        console.error("Lỗi khi gửi email bình luận:", err);
      });
    }
  } catch (error) {
    console.error("Lỗi trong notifyTaskComment:", error);
  }
}

