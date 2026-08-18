export type ProjectRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export const PROJECT_ROLES: { id: ProjectRole; label: string; description: string; badgeColor: string }[] = [
  {
    id: "OWNER",
    label: "Chủ dự án (Owner)",
    description: "Toàn quyền dự án, đổi cài đặt, quản lý phân quyền và xóa dự án",
    badgeColor: "#ef4444",
  },
  {
    id: "ADMIN",
    label: "Quản trị viên (Admin)",
    description: "Quản lý thành viên, tạo/đóng sprint, tạo/sửa/xóa mọi task",
    badgeColor: "#f97316",
  },
  {
    id: "MEMBER",
    label: "Thành viên (Member)",
    description: "Tạo task, cập nhật tiến độ, bình luận, quản lý checklist",
    badgeColor: "#6366f1",
  },
  {
    id: "VIEWER",
    label: "Người xem (Viewer)",
    description: "Chỉ xem thông tin, không được sửa đổi dữ liệu",
    badgeColor: "#64748b",
  },
];

export function canCreateTask(role?: string | null): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "MEMBER";
}

export function canEditTask(
  role?: string | null,
  isCreator: boolean = false,
  isAssignee: boolean = false
): boolean {
  if (role === "OWNER" || role === "ADMIN") return true;
  if (role === "MEMBER") return true; // Thành viên có thể cập nhật trạng thái/tiến độ
  return false;
}

export function canDeleteTask(role?: string | null, isCreator: boolean = false): boolean {
  if (role === "OWNER" || role === "ADMIN") return true;
  if (role === "MEMBER" && isCreator) return true;
  return false;
}

export function canManageMembers(role?: string | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function canManageSprints(role?: string | null): boolean {
  return role === "OWNER" || role === "ADMIN";
}

export function isViewer(role?: string | null): boolean {
  return role === "VIEWER";
}
