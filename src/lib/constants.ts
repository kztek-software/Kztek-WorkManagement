export const STATUSES = [
  { id: "BACKLOG", label: "Backlog", color: "#94a3b8" },
  { id: "TODO", label: "To do", color: "#6366f1" },
  { id: "IN_PROGRESS", label: "In progress", color: "#f59e0b" },
  { id: "IN_REVIEW", label: "In review", color: "#a855f7" },
  { id: "DONE", label: "Done", color: "#10b981" },
] as const;

export const PRIORITIES = [
  { id: "URGENT", label: "Urgent", color: "#ef4444", icon: "flame" },
  { id: "HIGH", label: "High", color: "#f97316", icon: "arrow-up" },
  { id: "MEDIUM", label: "Medium", color: "#eab308", icon: "equal" },
  { id: "LOW", label: "Low", color: "#94a3b8", icon: "arrow-down" },
] as const;

export const TASK_TYPES = [
  { id: "TASK", label: "Task", color: "#3b82f6" },
  { id: "STORY", label: "Story", color: "#10b981" },
  { id: "BUG", label: "Bug", color: "#ef4444" },
  { id: "EPIC", label: "Epic", color: "#a855f7" },
] as const;

export const TYPES = TASK_TYPES;

export const AVATAR_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#14b8a6",
  "#f43f5e",
];

export const LABEL_COLORS = [
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#a855f7",
  "#64748b",
  "#f59e0b",
  "#14b8a6",
  "#f43f5e",
  "#84cc16",
  "#06b6d4",
];

export const PROJECT_STATUSES = [
  {
    id: "PLANNING",
    label: "Lên kế hoạch",
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.12)",
    border: "rgba(59, 130, 246, 0.3)",
    description: "Dự án đang trong giai đoạn khảo sát, lập kế hoạch và phân bổ nguồn lực",
  },
  {
    id: "IN_PROGRESS",
    label: "Đang thực hiện",
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.12)",
    border: "rgba(16, 185, 129, 0.3)",
    description: "Dự án đang được tích cực triển khai theo các Sprint",
  },
  {
    id: "ON_HOLD",
    label: "Tạm dừng",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    border: "rgba(245, 158, 11, 0.3)",
    description: "Dự án tạm hoãn để chờ phản hồi khách hàng hoặc ưu tiên task khác",
  },
  {
    id: "COMPLETED",
    label: "Hoàn thành",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.3)",
    description: "Dự án đã nghiệm thu và bàn giao thành công",
  },
  {
    id: "CANCELLED",
    label: "Đã hủy",
    color: "#64748b",
    bg: "rgba(100, 116, 139, 0.12)",
    border: "rgba(100, 116, 139, 0.3)",
    description: "Dự án đã bị hủy bỏ",
  },
] as const;

export type ProjectStatusId = (typeof PROJECT_STATUSES)[number]["id"];

export function projectStatusMeta(id?: string | null) {
  return PROJECT_STATUSES.find((s) => s.id === id) ?? PROJECT_STATUSES[0];
}

export type StatusId = (typeof STATUSES)[number]["id"];
export type PriorityId = (typeof PRIORITIES)[number]["id"];
export type TaskTypeId = (typeof TASK_TYPES)[number]["id"];

export function statusMeta(id: string) {
  return STATUSES.find((s) => s.id === id) ?? STATUSES[0];
}
export function priorityMeta(id: string) {
  return PRIORITIES.find((p) => p.id === id) ?? PRIORITIES[2];
}
export function typeMeta(id: string) {
  return TASK_TYPES.find((t) => t.id === id) ?? TASK_TYPES[0];
}

