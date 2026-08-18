"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Shield, Trash2, Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { PROJECT_ROLES, type ProjectRole, canManageMembers } from "@/lib/permissions";

type MemberInfo = {
  id: string;
  userId: string;
  role: ProjectRole;
  user: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    title: string | null;
  };
};

type NonMember = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  title: string | null;
};

export function MemberDialog({
  projectId,
  open,
  onOpenChange,
  onMembersChanged,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMembersChanged?: () => void;
}) {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [nonMembers, setNonMembers] = useState<NonMember[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("MEMBER");
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<ProjectRole>("MEMBER");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
        setNonMembers(data.nonMembers || []);
        setCurrentRole(data.currentRole || "MEMBER");
        if (data.nonMembers?.length > 0) {
          setSelectedUserId(data.nonMembers[0].id);
        }
      }
    } catch {
      setError("Không thể tải danh sách thành viên");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, projectId]);

  const hasManageRight = canManageMembers(currentRole);

  async function handleAddMember() {
    if (!selectedUserId) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Thêm thành viên thất bại");
        return;
      }
      setSuccess("Đã thêm thành viên mới vào dự án!");
      loadData();
      onMembersChanged?.();
    } catch {
      setError("Lỗi kết nối máy chủ");
    }
  }

  async function handleUpdateRole(userId: string, newRole: ProjectRole) {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Đổi vai trò thất bại");
        return;
      }
      setSuccess("Đã cập nhật phân quyền thành công!");
      loadData();
      onMembersChanged?.();
    } catch {
      setError("Lỗi kết nối máy chủ");
    }
  }

  async function handleRemoveMember(userId: string, name: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa "${name}" khỏi dự án?`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Xóa thành viên thất bại");
        return;
      }
      setSuccess(`Đã xóa "${name}" khỏi dự án`);
      loadData();
      onMembersChanged?.();
    } catch {
      setError("Lỗi kết nối máy chủ");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5 text-accent" />
            Thành viên & Phân quyền Dự án
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-950/50 p-2.5 text-xs text-red-300 border border-red-800/40">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-950/50 p-2.5 text-xs text-emerald-300 border border-emerald-800/40">
            <Check className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Add new member section (Only for OWNER/ADMIN) */}
          {hasManageRight && nonMembers.length > 0 && (
            <div className="rounded-xl border border-line bg-surface/70 p-3.5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <UserPlus className="h-4 w-4 text-accent" />
                Thêm thành viên mới vào dự án
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 h-8.5 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none"
                >
                  {nonMembers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) {u.title ? `— ${u.title}` : ""}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
                  className="h-8.5 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="MEMBER">Thành viên (Member)</option>
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                  <option value="VIEWER">Người xem (Viewer)</option>
                </select>

                <Button size="sm" onClick={handleAddMember} className="h-8.5 text-xs px-3">
                  Thêm vào dự án
                </Button>
              </div>
            </div>
          )}

          {/* Members list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted px-1">
              <span>Danh sách thành viên ({members.length})</span>
              <span className="text-[11px]">Vai trò của bạn: <strong className="text-foreground">{currentRole}</strong></span>
            </div>

            <div className="divide-y divide-line rounded-xl border border-line bg-surface max-h-72 overflow-y-auto">
              {members.map((m) => {
                const isOwner = m.role === "OWNER";
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar>
                        <AvatarFallback color={m.user.avatarColor}>
                          {initials(m.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                          {m.user.name}
                          {isOwner && (
                            <span className="rounded bg-red-500/15 px-1.5 py-0.2 text-[10px] font-bold text-red-400">
                              Chủ dự án
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted truncate">
                          {m.user.email} {m.user.title ? `• ${m.user.title}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {hasManageRight && !isOwner ? (
                        <select
                          value={m.role}
                          onChange={(e) => handleUpdateRole(m.userId, e.target.value as ProjectRole)}
                          className="h-7.5 rounded-lg border border-line bg-surface-2 px-2 text-xs font-medium text-foreground focus:outline-none cursor-pointer"
                        >
                          <option value="ADMIN">Quản trị viên (Admin)</option>
                          <option value="MEMBER">Thành viên (Member)</option>
                          <option value="VIEWER">Người xem (Viewer)</option>
                        </select>
                      ) : (
                        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          {m.role}
                        </span>
                      )}

                      {hasManageRight && !isOwner && (
                        <button
                          onClick={() => handleRemoveMember(m.userId, m.user.name)}
                          className="rounded p-1.5 text-muted hover:bg-red-950/40 hover:text-red-400 cursor-pointer transition-colors"
                          title="Xóa khỏi dự án"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role explanation table */}
          <div className="rounded-lg bg-surface-2/40 p-3 text-[11px] text-muted space-y-1 border border-line/50">
            <div className="font-semibold text-foreground">💡 Giải thích phân quyền:</div>
            <div>• <strong className="text-red-400">OWNER / ADMIN</strong>: Toàn quyền quản lý thành viên, tạo sprint, xóa task và cấu hình.</div>
            <div>• <strong className="text-accent">MEMBER</strong>: Tạo task, kéo thả cập nhật trạng thái, bình luận và checklist.</div>
            <div>• <strong className="text-slate-400">VIEWER</strong>: Chỉ xem dữ liệu, không được tạo mới, sửa đổi hoặc kéo thả task.</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
