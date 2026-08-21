import { notificationQueue } from "@/lib/notification-queue";

export type NotificationType =
  | "ASSIGNED"
  | "STATUS_CHANGED"
  | "COMMENTED"
  | "MENTIONED"
  | "DUE_SOON"
  | "TICKET_CREATED"
  | "TICKET_UPDATED";

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
 * Gửi thông báo chung: Đẩy vào Hàng đợi Bất đồng bộ (Non-blocking / Đa luồng ngầm)
 */
export async function sendNotification(params: CreateNotificationParams): Promise<void> {
  notificationQueue.enqueue({
    type: "CUSTOM_NOTIFICATION",
    userId: params.userId,
    actorId: params.actorId,
    notificationType: params.type,
    title: params.title,
    message: params.message,
    link: params.link,
    projectId: params.projectId,
  });
}

/**
 * Kích hoạt thông báo khi GIAO VIỆC (Task Assigned):
 * Đẩy vào Hàng đợi Bất đồng bộ ngầm (0ms, không chặn HTTP Response)
 */
export function notifyTaskAssigned(params: {
  taskId: string;
  assigneeId: string;
  actorId: string;
  projectId: string;
}): void {
  if (!params.assigneeId) return;

  notificationQueue.enqueue({
    type: "TASK_ASSIGNED",
    taskId: params.taskId,
    assigneeId: params.assigneeId,
    actorId: params.actorId,
    projectId: params.projectId,
  });
}

/**
 * Kích hoạt thông báo khi THAY ĐỔI TRẠNG THÁI (Status Changed):
 * Đẩy vào Hàng đợi Bất đồng bộ ngầm (0ms, không chặn HTTP Response)
 */
export function notifyTaskStatusChanged(params: {
  taskId: string;
  actorId: string;
  oldStatus: string;
  newStatus: string;
  projectId: string;
}): void {
  notificationQueue.enqueue({
    type: "TASK_STATUS_CHANGED",
    taskId: params.taskId,
    actorId: params.actorId,
    oldStatus: params.oldStatus,
    newStatus: params.newStatus,
    projectId: params.projectId,
  });
}

/**
 * Kích hoạt thông báo khi GẮN THẺ / TAG (@mention):
 * Đẩy vào Hàng đợi Bất đồng bộ ngầm (0ms, không chặn HTTP Response)
 */
export function notifyTaskMention(params: {
  taskId: string;
  authorId: string;
  commentBody: string;
  mentionedUserIds: string[];
  projectId: string;
}): void {
  if (!params.mentionedUserIds || params.mentionedUserIds.length === 0) return;

  notificationQueue.enqueue({
    type: "TASK_MENTION",
    taskId: params.taskId,
    authorId: params.authorId,
    commentBody: params.commentBody,
    mentionedUserIds: params.mentionedUserIds,
    projectId: params.projectId,
  });
}

/**
 * Kích hoạt thông báo khi CÓ BÌNH LUẬN MỚI (Task Comment):
 * Đẩy vào Hàng đợi Bất đồng bộ ngầm (0ms, không chặn HTTP Response)
 */
export function notifyTaskComment(params: {
  taskId: string;
  authorId: string;
  commentBody: string;
  projectId: string;
  excludeUserIds?: string[];
}): void {
  notificationQueue.enqueue({
    type: "TASK_COMMENT",
    taskId: params.taskId,
    authorId: params.authorId,
    commentBody: params.commentBody,
    projectId: params.projectId,
    excludeUserIds: params.excludeUserIds,
  });
}