"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Check,
  AlertCircle,
  Building2,
  UserCheck,
  Plus,
  Loader2,
} from "lucide-react";
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
    teamId?: string | null;
    team?: { id: string; name: string; code: string; color: string } | null;
  };
};

type NonMember = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  title: string | null;
  teamId?: string | null;
  team?: { id: string; name: string; code: string; color: string } | null;
};

type TeamItem = {
  id: string;
  name: string;
  code: string;
  color: string;
  members: { id: string; name: string; email: string; avatarColor: string; title: string | null }[];
};

type RoleOption = {
  id: string;
  key: string;
  name: string;
  color?: string;
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
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("MEMBER");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [addMode, setAddMode] = useState<"individual" | "team">("team");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
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
        setTeams(data.teams || []);
        setAvailableRoles(data.roles || []);
        setCurrentRole(data.currentRole || "MEMBER");

        if (data.nonMembers?.length > 0) {
          setSelectedUserId(data.nonMembers[0].id);
        }
        if (data.teams?.length > 0) {
          setSelectedTeamId(data.teams[0].id);
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

  // Thêm cá nhân
  async function handleAddIndividualMember() {
    if (!selectedUserId) return;
    setError(null);
    setSuccess(null);
    setAdding(true);
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("permissions-updated"));
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setAdding(false);
    }
  }

  // Thêm toàn bộ phòng ban
  async function handleAddTeamMembers() {
    if (!selectedTeamId) return;
    setError(null);
    setSuccess(null);
    setAdding(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: selectedTeamId, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Thêm phòng ban thất bại");
        return;
      }
      setSuccess(data.message || "Đã thêm các thành viên phòng ban vào dự án!");
      loadData();
      onMembersChanged?.();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("permissions-updated"));
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setAdding(false);
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("permissions-updated"));
      }
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
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("permissions-updated"));
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    }
  }

  const roleOptions = availableRoles.length > 0
    ? availableRoles
    : [
        { key: "ADMIN", name: "Quản trị viên (Admin)" },
        { key: "TECH_LEAD", name: "Trưởng nhóm kỹ thuật (Tech Lead)" },
        { key: "DEVELOPER", name: "Lập trình viên (Developer)" },
        { key: "TESTER", name: "Kiểm thử viên (QA / QC)" },
        { key: "MEMBER", name: "Thành viên (Member)" },
        { key: "VIEWER", name: "Người xem (Viewer)" },
      ];

  const selectedTeamData = teams.find((t) => t.id === selectedTeamId);
  const selectedTeamAvailableCount = selectedTeamData
    ? selectedTeamData.members.filter((tm) => nonMembers.some((nm) => nm.id === tm.id)).length
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Users className="h-5 w-5 text-accent" />
            Thành viên & Phân quyền Dự án
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-accent/10 p-2.5 text-xs text-accent border border-accent/30">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 p-2.5 text-xs text-emerald-600 border border-emerald-500/30">
            <Check className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Add member section (Only for OWNER/ADMIN) */}
          {hasManageRight && (
            <div className="rounded-xl border border-line bg-surface/70 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <UserPlus className="h-4 w-4 text-accent" />
                  Thêm nhân sự vào dự án
                </div>

                {/* Switch Add Mode */}
                <div className="flex items-center rounded-lg bg-surface-2 p-0.5 border border-line">
                  <button
                    type="button"
                    onClick={() => setAddMode("team")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      addMode === "team" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Building2 className="h-3 w-3" /> Theo Phòng Ban
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMode("individual")}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                      addMode === "individual" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-foreground"
                    }`}
                  >
                    <Users className="h-3 w-3" /> Từng người
                  </button>
                </div>
              </div>

              {/* Form Mode 1: Theo Phòng Ban */}
              {addMode === "team" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="flex-1 min-w-[200px] h-8.5 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          🏢 {t.name} ({t.members.length} nhân sự)
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
                      className="h-8.5 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer"
                    >
                      {roleOptions.map((r) => (
                        <option key={r.key} value={r.key}>
                          {r.name}
                        </option>
                      ))}
                    </select>

                    <Button
                      size="sm"
                      onClick={handleAddTeamMembers}
                      disabled={adding || selectedTeamAvailableCount === 0}
                      className="h-8.5 text-xs px-3 font-bold bg-accent hover:bg-accent/90 text-white shadow-sm shrink-0"
                    >
                      {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                      Thêm cả phòng ban ({selectedTeamAvailableCount} người)
                    </Button>
                  </div>

                  {selectedTeamData && (
                    <div className="text-[11px] text-muted flex items-center gap-2 px-1">
                      <span>• Tổng: {selectedTeamData.members.length} thành viên</span>
                      <span>• Chưa tham gia: <strong className="text-emerald-600">{selectedTeamAvailableCount}</strong> người</span>
                      {selectedTeamAvailableCount === 0 && (
                        <span className="text-amber-600 font-semibold">(Tất cả đã có mặt trong dự án)</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Form Mode 2: Từng Cá Nhân */}
              {addMode === "individual" && (
                <div>
                  {nonMembers.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="flex-1 min-w-[200px] h-8.5 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer"
                      >
                        {nonMembers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.email}) {u.team ? `— [${u.team.name}]` : ""} {u.title ? `• ${u.title}` : ""}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
                        className="h-8.5 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer"
                      >
                        {roleOptions.map((r) => (
                          <option key={r.key} value={r.key}>
                            {r.name}
                          </option>
                        ))}
                      </select>

                      <Button
                        size="sm"
                        onClick={handleAddIndividualMember}
                        disabled={adding}
                        className="h-8.5 text-xs px-3 font-bold bg-accent hover:bg-accent/90 text-white shadow-sm shrink-0"
                      >
                        {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                        Thêm vào dự án
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted py-1">
                      Tất cả tài khoản trong hệ thống đều đã tham gia dự án này.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Members list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted px-1">
              <span className="font-semibold text-foreground">
                Danh sách thành viên hiện tại ({members.length})
              </span>
              <span className="text-[11px]">
                Vai trò của bạn: <strong className="text-accent">{currentRole}</strong>
              </span>
            </div>

            <div className="divide-y divide-line rounded-xl border border-line bg-surface max-h-72 overflow-y-auto">
              {members.map((m) => {
                const isOwner = m.role === "OWNER";
                const roleObj = roleOptions.find((ro) => ro.key === m.role);
                const roleDisplayName = roleObj ? roleObj.name : m.role;

                return (
                  <div key={m.id} className="flex items-center justify-between p-3 gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Avatar className="h-8 w-8 border border-white/10 shrink-0">
                        <AvatarFallback color={m.user.avatarColor}>
                          {initials(m.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                          <span>{m.user.name}</span>
                          {isOwner && (
                            <span className="rounded bg-accent/15 border border-accent/30 px-1.5 py-0.1 text-[9px] font-black text-accent">
                              Chủ dự án
                            </span>
                          )}
                          {m.user.team && (
                            <span
                              className="rounded px-1.5 py-0.1 text-[9px] font-semibold"
                              style={{
                                backgroundColor: `${m.user.team.color}18`,
                                color: m.user.team.color,
                                border: `1px solid ${m.user.team.color}35`,
                              }}
                            >
                              {m.user.team.name}
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
                          {roleOptions.map((r) => (
                            <option key={r.key} value={r.key}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted flex items-center gap-1 border border-line">
                          <Shield className="h-3 w-3" />
                          {roleDisplayName}
                        </span>
                      )}

                      {hasManageRight && !isOwner && (
                        <button
                          onClick={() => handleRemoveMember(m.userId, m.user.name)}
                          className="rounded p-1.5 text-muted hover:bg-accent/10 hover:text-accent cursor-pointer transition-colors"
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
            <div>• <strong className="text-accent">OWNER / ADMIN</strong>: Toàn quyền quản lý thành viên, tạo sprint, xóa task và cấu hình.</div>
            <div>• <strong className="text-accent">MEMBER</strong>: Tạo task, kéo thả cập nhật trạng thái, bình luận và checklist.</div>
            <div>• <strong className="text-slate-600">VIEWER</strong>: Chỉ xem dữ liệu, không được tạo mới, sửa đổi hoặc kéo thả task.</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
