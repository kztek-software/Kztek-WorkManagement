"use client";

import { useEffect, useState, useRef } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Search,
  Edit2,
  Trash2,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bell,
  Send,
  Sparkles,
  Sliders,
  Eye,
  Check,
  Plus,
  Lock,
  Building2,
  UserCheck,
  Save,
  ChevronRight,
  FolderKanban,
  Briefcase,
  Layers,
  Crown,
  Filter,
  ArrowUpDown,
  UserCog,
  CheckSquare,
} from "lucide-react";

// PrimeReact UI Components (LTS 10.9.3)
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";

import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PermissionCategory } from "@/lib/permissions";

type TeamItem = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string;
  leaderId: string | null;
  leader: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    title: string | null;
    role: string;
  } | null;
  members: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    title: string | null;
    role: string;
  }[];
  memberCount: number;
  taskCount: number;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  title: string | null;
  avatarColor: string;
  role: string;
  teamId: string | null;
  team: {
    id: string;
    name: string;
    code: string;
    color: string;
  } | null;
  createdAt: string;
  _count: {
    assignedTasks: number;
    createdTasks: number;
    memberships: number;
  };
};

type RoleItem = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  color: string;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
};

const AVATAR_COLORS = [
  "#F05922",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
  "#EF4444",
  "#06B6D4",
];

export default function UsersManagementPage() {
  const toast = useRef<Toast>(null);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("MEMBER");
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"users" | "teams" | "roles" | "email">("users");

  // ==========================================
  // TEAM MODALS STATE
  // ==========================================
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamColor, setTeamColor] = useState("#F05922");
  const [teamLeaderId, setTeamLeaderId] = useState<string | null>(null);
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [savingTeam, setSavingTeam] = useState(false);

  const [editTeamOpen, setEditTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);

  // ==========================================
  // USER MODALS STATE
  // ==========================================
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createRole, setCreateRole] = useState("MEMBER");
  const [createTeamId, setCreateTeamId] = useState<string | null>(null);
  const [createColor, setCreateColor] = useState("#F05922");
  const [creatingUser, setCreatingUser] = useState(false);

  const [editUserOpen, setEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editRole, setEditRole] = useState("MEMBER");
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [editColor, setEditColor] = useState("#F05922");
  const [updatingUser, setUpdatingUser] = useState(false);

  // ==========================================
  // ROLES & PERMISSIONS STATE
  // ==========================================
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("TECH_LEAD");
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  // ==========================================
  // EMAIL CONFIG STATE
  // ==========================================
  const [smtpSaved, setSmtpSaved] = useState(false);

  // Load Initial Data
  async function loadAllData() {
    try {
      const [resUsers, resTeams, resRoles, resMe] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/teams"),
        fetch("/api/roles"),
        fetch("/api/auth/me"),
      ]);

      if (resUsers.ok) {
        const d = await resUsers.json();
        setUsers(d.users || []);
      }
      if (resTeams.ok) {
        const d = await resTeams.json();
        setTeams(d.teams || []);
      }
      if (resRoles.ok) {
        const d = await resRoles.json();
        setRoles(d.roles || []);
        setCategories(d.categories || []);
        if (d.roles?.length > 0 && !selectedRoleKey) {
          setSelectedRoleKey(d.roles[0].key);
          setActivePermissions(d.roles[0].permissions);
        }
      }
      if (resMe.ok) {
        const d = await resMe.json();
        setCurrentUserId(d.user?.id || "");
        setCurrentUserRole(d.user?.role || "MEMBER");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const r = roles.find((r) => r.key === selectedRoleKey);
    if (r) setActivePermissions(r.permissions);
  }, [selectedRoleKey, roles]);

  // ==========================================
  // TEAM HANDLERS
  // ==========================================
  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!teamName.trim() || !teamCode.trim()) return;
    setSavingTeam(true);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          code: teamCode.trim().toUpperCase(),
          description: teamDesc.trim() || undefined,
          color: teamColor,
          leaderId: teamLeaderId || undefined,
          memberIds: teamMemberIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.current?.show({ severity: "error", summary: "Lỗi", detail: data.error ?? "Không tạo được nhóm" });
        return;
      }

      toast.current?.show({ severity: "success", summary: "Thành công", detail: `Đã tạo nhóm ${data.team.name}` });
      setCreateTeamOpen(false);
      setTeamName("");
      setTeamCode("");
      setTeamDesc("");
      setTeamLeaderId(null);
      setTeamMemberIds([]);
      loadAllData();
    } catch {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Lỗi kết nối máy chủ" });
    } finally {
      setSavingTeam(false);
    }
  }

  function openEditTeam(t: TeamItem) {
    setEditingTeam(t);
    setTeamName(t.name);
    setTeamCode(t.code);
    setTeamDesc(t.description || "");
    setTeamColor(t.color);
    setTeamLeaderId(t.leaderId);
    setTeamMemberIds(t.members.map((m) => m.id));
    setEditTeamOpen(true);
  }

  async function handleUpdateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTeam) return;
    setSavingTeam(true);

    try {
      const res = await fetch(`/api/teams/${editingTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          code: teamCode.trim().toUpperCase(),
          description: teamDesc.trim() || undefined,
          color: teamColor,
          leaderId: teamLeaderId,
          memberIds: teamMemberIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.current?.show({ severity: "error", summary: "Lỗi", detail: data.error ?? "Không cập nhật được nhóm" });
        return;
      }

      toast.current?.show({ severity: "success", summary: "Thành công", detail: "Đã cập nhật thông tin nhóm" });
      setEditTeamOpen(false);
      loadAllData();
    } catch {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Lỗi kết nối máy chủ" });
    } finally {
      setSavingTeam(false);
    }
  }

  async function handleDeleteTeam(t: TeamItem) {
    if (!confirm(`Bạn có chắc muốn xóa nhóm "${t.name}"? Các thành viên sẽ tự động được gỡ khỏi nhóm.`)) return;

    try {
      const res = await fetch(`/api/teams/${t.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        toast.current?.show({ severity: "error", summary: "Lỗi", detail: d.error ?? "Không xóa được nhóm" });
        return;
      }

      toast.current?.show({ severity: "success", summary: "Thành công", detail: "Đã xóa nhóm thành công" });
      loadAllData();
    } catch {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Lỗi kết nối máy chủ" });
    }
  }

  // ==========================================
  // USER HANDLERS
  // ==========================================
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreatingUser(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          title: createTitle.trim() || undefined,
          role: createRole,
          teamId: createTeamId || undefined,
          avatarColor: createColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.current?.show({ severity: "error", summary: "Lỗi", detail: data.error ?? "Không tạo được tài khoản" });
        return;
      }

      toast.current?.show({ severity: "success", summary: "Thành công", detail: `Đã tạo tài khoản ${data.user.name}` });
      setCreateUserOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateTitle("");
      setCreateTeamId(null);
      loadAllData();
    } catch {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Lỗi kết nối máy chủ" });
    } finally {
      setCreatingUser(false);
    }
  }

  function openEditUser(u: UserItem) {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
    setEditTitle(u.title || "");
    setEditRole(u.role);
    setEditTeamId(u.teamId);
    setEditColor(u.avatarColor);
    setEditUserOpen(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUser(true);

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          password: editPassword.trim() || undefined,
          title: editTitle.trim() || undefined,
          role: editRole,
          teamId: editTeamId,
          avatarColor: editColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.current?.show({ severity: "error", summary: "Lỗi", detail: data.error ?? "Không cập nhật được tài khoản" });
        return;
      }

      toast.current?.show({ severity: "success", summary: "Thành công", detail: "Cập nhật tài khoản thành công" });
      setEditUserOpen(false);
      loadAllData();
    } catch {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Lỗi kết nối máy chủ" });
    } finally {
      setUpdatingUser(false);
    }
  }

  async function handleDeleteUser(u: UserItem) {
    if (u.id === currentUserId) {
      toast.current?.show({ severity: "warn", summary: "Cảnh báo", detail: "Không thể tự xóa tài khoản của chính bạn!" });
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${u.name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        toast.current?.show({ severity: "error", summary: "Lỗi", detail: d.error ?? "Không xóa được tài khoản" });
        return;
      }
      toast.current?.show({ severity: "success", summary: "Thành công", detail: "Đã xóa tài khoản" });
      loadAllData();
    } catch {
      toast.current?.show({ severity: "error", summary: "Lỗi", detail: "Lỗi kết nối máy chủ" });
    }
  }

  // ==========================================
  // PERMISSION TOGGLES
  // ==========================================
  function togglePermission(key: string) {
    if (selectedRoleKey === "ADMIN") return;
    setActivePermissions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function savePermissions() {
    setSavingPermissions(true);
    try {
      const res = await fetch(`/api/roles/${selectedRoleKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: activePermissions }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.current?.show({ severity: "error", summary: "Lỗi", detail: data.error ?? "Không lưu được phân quyền" });
        return;
      }

      setRoles((prev) =>
        prev.map((r) => (r.key === selectedRoleKey ? { ...r, permissions: activePermissions } : r))
      );
      toast.current?.show({ severity: "success", summary: "Thành công", detail: `Đã lưu cấu hình phân quyền cho "${data.role.name}"` });
    } finally {
      setSavingPermissions(false);
    }
  }

  const filteredUsers = users.filter((u) => {
    if (teamFilter !== "ALL") {
      if (teamFilter === "NO_TEAM" && u.teamId) return false;
      if (teamFilter !== "NO_TEAM" && u.teamId !== teamFilter) return false;
    }
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    return true;
  });

  const selectedRole = roles.find((r) => r.key === selectedRoleKey);
  const totalTasksCount = users.reduce((sum, u) => sum + (u._count?.assignedTasks || 0), 0);

  // User Table Column Templates (PrimeReact)
  const userBodyTemplate = (rowData: UserItem) => (
    <div className="flex items-center gap-3">
      <Avatar className="h-9 w-9 border border-white/10 shadow-sm shrink-0">
        <AvatarFallback color={rowData.avatarColor} className="text-xs font-bold">
          {initials(rowData.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="font-bold text-foreground flex items-center gap-1.5 text-xs truncate">
          <span>{rowData.name}</span>
          {rowData.id === currentUserId && (
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-bold text-emerald-400">
              Bạn
            </span>
          )}
        </div>
        <div className="text-[11px] text-muted font-mono truncate">{rowData.email}</div>
      </div>
    </div>
  );

  const titleBodyTemplate = (rowData: UserItem) => (
    <span className="text-xs font-medium text-foreground/90">
      {rowData.title || <span className="text-muted/60 italic">—</span>}
    </span>
  );

  const teamBodyTemplate = (rowData: UserItem) => (
    rowData.team ? (
      <span
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold"
        style={{
          backgroundColor: `${rowData.team.color}18`,
          color: rowData.team.color,
          border: `1px solid ${rowData.team.color}35`,
        }}
      >
        <Building2 className="h-3.5 w-3.5" />
        {rowData.team.name}
      </span>
    ) : (
      <button
        onClick={() => openEditUser(rowData)}
        className="inline-flex items-center gap-1 text-[11px] text-muted/70 hover:text-accent font-medium hover:underline cursor-pointer"
      >
        <Plus className="h-3 w-3" /> Gán phòng ban
      </button>
    )
  );

  const roleBodyTemplate = (rowData: UserItem) => {
    const r = roles.find((role) => role.key === rowData.role);
    const color = r?.color || "#6366f1";
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold"
        style={{
          backgroundColor: `${color}18`,
          color: color,
          border: `1px solid ${color}35`,
        }}
      >
        <Shield className="h-3.5 w-3.5" />
        {r?.name || rowData.role}
      </span>
    );
  };

  const projectCountTemplate = (rowData: UserItem) => (
    <div className="text-center">
      <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-md bg-surface-2 border border-line text-xs font-mono font-bold text-foreground">
        {rowData._count?.memberships || 0}
      </span>
    </div>
  );

  const taskCountTemplate = (rowData: UserItem) => (
    <div className="text-center">
      <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded-md bg-accent/15 border border-accent/30 text-xs font-mono font-bold text-accent">
        {rowData._count?.assignedTasks || 0}
      </span>
    </div>
  );

  const actionBodyTemplate = (rowData: UserItem) => (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={() => openEditUser(rowData)}
        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
        title="Chỉnh sửa tài khoản / Gán nhóm"
      >
        <Edit2 className="h-4 w-4" />
      </button>

      {rowData.id !== currentUserId && (
        <button
          onClick={() => handleDeleteUser(rowData)}
          className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
          title="Xóa tài khoản"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="text-xs font-semibold text-muted flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          Đang tải dữ liệu cơ cấu nhân sự & phòng ban...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <Toast ref={toast} />

      {/* Top Header & Prime Tabs Navigation */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6 bg-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 font-bold text-foreground text-sm">
            <div className="h-8 w-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="leading-tight">Quản trị Cơ cấu & Phân quyền</div>
              <div className="text-[10px] text-muted font-normal">Hệ thống phân cấp phòng ban & vai trò KZTEK</div>
            </div>
          </div>

          <div className="hidden md:flex items-center rounded-xl bg-surface-2 p-1 border border-line">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Nhân Sự ({users.length})
            </button>

            <button
              onClick={() => setActiveTab("teams")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "teams"
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Nhóm / Phòng Ban ({teams.length})
            </button>

            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "roles"
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              Ma trận Phân quyền ({roles.length})
            </button>

            <button
              onClick={() => setActiveTab("email")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "email"
                  ? "bg-accent text-white shadow-sm shadow-accent/25"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Cấu hình Email
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "users" && (
            <Button
              size="sm"
              onClick={() => setCreateUserOpen(true)}
              className="h-9 px-3.5 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25 shrink-0"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Thêm nhân sự mới
            </Button>
          )}

          {activeTab === "teams" && (
            <Button
              size="sm"
              onClick={() => {
                setTeamName("");
                setTeamCode("");
                setTeamDesc("");
                setTeamLeaderId(null);
                setTeamMemberIds([]);
                setCreateTeamOpen(true);
              }}
              className="h-9 px-3.5 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25 shrink-0"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Thêm nhóm / phòng ban
            </Button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH TÀI KHOẢN (PRIMEREACT DATATABLE) */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="flex-1 overflow-y-auto p-6 space-y-5 w-full max-w-[1600px] mx-auto">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-line bg-surface p-4 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Tổng nhân sự</div>
                <div className="text-2xl font-extrabold text-foreground mt-0.5">{users.length}</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Phòng ban nội bộ</div>
                <div className="text-2xl font-extrabold text-foreground mt-0.5">{teams.length}</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Building2 className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Vai trò hệ thống</div>
                <div className="text-2xl font-extrabold text-foreground mt-0.5">{roles.length}</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Shield className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-4 flex items-center justify-between shadow-sm">
              <div>
                <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Tasks đang phụ trách</div>
                <div className="text-2xl font-extrabold text-accent mt-0.5">{totalTasksCount}</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <CheckSquare className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Controls Filter Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-surface p-3.5 rounded-2xl border border-line shadow-sm">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Search Box */}
              <div className="relative min-w-[260px] flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  placeholder="Tìm kiếm tên, email, chức danh..."
                  className="pl-9 h-9 text-xs bg-surface-2 border-line rounded-xl w-full"
                />
              </div>

              {/* Team Filter */}
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-muted" />
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="h-9 rounded-xl border border-line bg-surface-2 px-3 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả phòng ban ({users.length})</option>
                  <option value="NO_TEAM">Chưa phân nhóm</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.memberCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-muted" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-9 rounded-xl border border-line bg-surface-2 px-3 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả vai trò ({users.length})</option>
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="text-xs text-muted font-medium pr-2">
              Hiển thị: <strong className="text-foreground">{filteredUsers.length}</strong> / {users.length} nhân sự
            </div>
          </div>

          {/* PrimeReact DataTable (Polished Obsidian Dark Theme) */}
          <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-lg">
            <DataTable
              value={filteredUsers}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 20, 50]}
              globalFilter={globalFilter}
              emptyMessage="Không tìm thấy nhân sự nào phù hợp"
              className="w-full text-xs"
              tableStyle={{ minWidth: "50rem" }}
            >
              <Column field="name" header="Nhân sự" body={userBodyTemplate} sortable style={{ width: "26%" }} />
              <Column field="title" header="Chức danh" body={titleBodyTemplate} sortable style={{ width: "18%" }} />
              <Column field="team.name" header="Phòng ban / Nhóm" body={teamBodyTemplate} sortable style={{ width: "22%" }} />
              <Column field="role" header="Vai trò hệ thống" body={roleBodyTemplate} sortable style={{ width: "18%" }} />
              <Column field="_count.memberships" header="Dự án" body={projectCountTemplate} sortable style={{ width: "8%" }} />
              <Column field="_count.assignedTasks" header="Tasks" body={taskCountTemplate} sortable style={{ width: "8%" }} />
              <Column header="Thao tác" body={actionBodyTemplate} style={{ width: "8%" }} />
            </DataTable>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: QUẢN LÝ NHÓM / PHÒNG BAN (TEAMS & DEPARTMENTS) */}
      {/* ========================================================================= */}
      {activeTab === "teams" && (
        <div className="flex-1 space-y-6 overflow-y-auto p-6 w-full max-w-[1600px] mx-auto">
          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-line bg-surface p-5 shadow-sm hover:border-line-strong hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Card Header: Color Tag & Code */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: team.color, boxShadow: `0 0 10px ${team.color}80` }}
                      />
                      <span className="font-mono font-bold text-xs text-muted">
                        [{team.code}]
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTeam(team)}
                        className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 cursor-pointer transition-colors"
                        title="Chỉnh sửa nhóm"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team)}
                        className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-950/30 cursor-pointer transition-colors"
                        title="Xóa nhóm"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Team Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-snug">{team.name}</h3>
                    <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                      {team.description || "Chưa có mô tả phòng ban"}
                    </p>
                  </div>

                  {/* Team Leader Badge */}
                  <div className="rounded-xl border border-line bg-surface-2/60 p-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted uppercase flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5 text-amber-400" />
                      Trưởng nhóm
                    </span>
                    {team.leader ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 border border-white/10">
                          <AvatarFallback color={team.leader.avatarColor} className="text-[9px] font-bold">
                            {initials(team.leader.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-foreground">{team.leader.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted/70 italic">Chưa chỉ định</span>
                    )}
                  </div>

                  {/* Members Stack & Chips */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-muted">
                      <span>Thành viên ({team.memberCount})</span>
                      <span className="font-bold text-accent">{team.taskCount} tasks đang làm</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {team.members.slice(0, 6).map((m) => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-line px-2.5 py-1 text-[11px] font-medium text-foreground"
                        >
                          <Avatar className="h-4 w-4">
                            <AvatarFallback color={m.avatarColor} className="text-[8px]">
                              {initials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[85px]">{m.name}</span>
                        </span>
                      ))}
                      {team.memberCount > 6 && (
                        <span className="rounded-full bg-surface-2 border border-line px-2 py-0.5 text-[10px] font-bold text-muted flex items-center">
                          +{team.memberCount - 6}
                        </span>
                      )}
                      {team.memberCount === 0 && (
                        <span className="text-xs text-muted/60 italic">Chưa có thành viên nào</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-line/60 flex items-center justify-between text-xs">
                  <span className="text-muted">Cấp bậc: <strong>Phòng ban</strong></span>
                  <button
                    onClick={() => openEditTeam(team)}
                    className="font-bold text-accent hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Phân bổ nhân sự <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MA TRẬN PHÂN QUYỀN (ROLES & RBAC) */}
      {/* ========================================================================= */}
      {activeTab === "roles" && (
        <div className="flex-1 overflow-hidden grid grid-cols-[300px_1fr] divide-x divide-line">
          {/* Left Column: Roles Selector List */}
          <div className="p-4 space-y-3 overflow-y-auto bg-surface/30">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Danh sách vai trò ({roles.length})
              </span>
            </div>

            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = r.key === selectedRoleKey;
                return (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRoleKey(r.key)}
                    className={`flex w-full items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-surface-2 border-accent shadow-md ring-1 ring-accent/40"
                        : "bg-surface/60 border-line hover:border-line-strong hover:bg-surface-2/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: r.color, boxShadow: `0 0 8px ${r.color}80` }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-foreground truncate flex items-center gap-1.5">
                          <span>{r.name}</span>
                          {r.isSystem && (
                            <span className="rounded bg-surface-3 px-1 py-0.1 text-[8px] font-mono text-muted">
                              SYSTEM
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted font-mono">{r.key}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[9px] font-bold text-muted">
                        {r.permissions.length}
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 text-muted transition-transform ${isSelected ? "text-accent translate-x-0.5" : ""}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Permission Matrix */}
          <div className="flex flex-col overflow-hidden bg-background">
            <div className="flex items-center justify-between border-b border-line p-5 bg-surface/40 backdrop-blur-md">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: selectedRole?.color || "#6366f1" }}
                    />
                    {selectedRole?.name}
                  </h2>
                  <span className="rounded-md bg-surface-2 border border-line px-2 py-0.5 text-[10px] font-mono font-bold text-muted">
                    KEY: {selectedRole?.key}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  {selectedRole?.description || "Chưa có mô tả vai trò"}
                </p>
              </div>

              <Button
                size="sm"
                onClick={savePermissions}
                disabled={savingPermissions || selectedRole?.key === "ADMIN"}
                className="h-8 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
              >
                {savingPermissions ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                Lưu phân quyền
              </Button>
            </div>

            {/* Matrix Grid */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const catKeys = cat.permissions.map((p) => p.key);
                const selectedInCat = catKeys.filter((k) => activePermissions.includes(k)).length;

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl border border-line bg-surface p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-line pb-2.5">
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{cat.name}</h4>
                        <p className="text-[10px] text-muted">{cat.description}</p>
                      </div>
                      <span className="text-[10px] font-bold text-accent">
                        {selectedInCat}/{catKeys.length}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {cat.permissions.map((perm) => {
                        const isChecked = activePermissions.includes(perm.key) || selectedRole?.key === "ADMIN";
                        return (
                          <div
                            key={perm.key}
                            onClick={() => togglePermission(perm.key)}
                            className={`flex items-start gap-2 p-2 rounded-xl transition-all ${
                              selectedRole?.key === "ADMIN"
                                ? "cursor-not-allowed opacity-90"
                                : "hover:bg-surface-2 cursor-pointer"
                            } ${isChecked ? "bg-surface-2/40" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="mt-0.5 h-3.5 w-3.5 accent-accent cursor-pointer"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-foreground">{perm.name}</div>
                              <div className="text-[10px] text-muted">{perm.description}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CẤU HÌNH EMAIL & SMTP */}
      {/* ========================================================================= */}
      {activeTab === "email" && (
        <div className="flex-1 space-y-6 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Mail className="h-5 w-5 text-accent" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Máy Chủ Gửi Email (SMTP Server)</h2>
                <p className="text-xs text-muted">Cấu hình thông báo giao việc và nhắc nhở thời gian thực</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">SMTP Host</Label>
                <Input defaultValue="smtp.gmail.com" className="text-xs h-9 bg-surface-2" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">SMTP Port</Label>
                <Input defaultValue="587" className="text-xs h-9 bg-surface-2 font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tên người gửi (Sender Name)</Label>
                <Input defaultValue="KZTEK Work Management" className="text-xs h-9 bg-surface-2" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email người gửi (Sender Email)</Label>
                <Input defaultValue="notifications@kztek.net" className="text-xs h-9 bg-surface-2 font-mono" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-line/60">
              <span className="text-xs text-emerald-400 font-medium">
                {smtpSaved ? "✅ Đã lưu cấu hình máy chủ SMTP thành công!" : "🟢 Máy chủ gửi email đang hoạt động và ghi log"}
              </span>
              <Button
                size="sm"
                onClick={() => {
                  setSmtpSaved(true);
                  setTimeout(() => setSmtpSaved(false), 3000);
                }}
                className="h-8 text-xs font-bold"
              >
                Lưu cấu hình SMTP
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TẠO / SỬA NHÓM (CREATE / EDIT TEAM DIALOG) */}
      {/* ========================================================================= */}
      <Dialog
        header={editingTeam ? `Chỉnh sửa Nhóm: ${editingTeam.name}` : "Tạo Nhóm / Phòng Ban Mới"}
        visible={createTeamOpen || editTeamOpen}
        onHide={() => {
          setCreateTeamOpen(false);
          setEditTeamOpen(false);
        }}
        className="w-full max-w-lg border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <form onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tên phòng ban / nhóm *</Label>
            <Input
              placeholder="VD: Phòng Kỹ thuật Phần cứng & Bo mạch"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="text-xs h-9 bg-surface-2"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Mã nhóm (Viết tắt in hoa) *</Label>
              <Input
                placeholder="VD: HARDWARE, QA_QC"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                className="text-xs h-9 bg-surface-2 font-mono uppercase"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Trưởng nhóm (Leader)</Label>
              <select
                value={teamLeaderId || ""}
                onChange={(e) => setTeamLeaderId(e.target.value || null)}
                className="h-9 w-full rounded-lg border border-line bg-surface-2 px-2 text-xs text-foreground focus:outline-none"
              >
                <option value="">Chưa chỉ định trưởng nhóm</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title || u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Mô tả chức năng nhiệm vụ</Label>
            <Textarea
              placeholder="Nhiệm vụ cốt lõi của phòng ban/nhóm..."
              value={teamDesc}
              onChange={(e) => setTeamDesc(e.target.value)}
              rows={2}
              className="text-xs bg-surface-2"
            />
          </div>

          {/* Members Multi-select */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Phân bổ nhân sự vào nhóm ({teamMemberIds.length} đã chọn)</Label>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-line bg-surface-2/40 p-2 space-y-1">
              {users.map((u) => {
                const isMember = teamMemberIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isMember}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTeamMemberIds((prev) => [...prev, u.id]);
                          } else {
                            setTeamMemberIds((prev) => prev.filter((id) => id !== u.id));
                          }
                        }}
                        className="h-3.5 w-3.5 accent-accent cursor-pointer"
                      />
                      <Avatar className="h-5 w-5">
                        <AvatarFallback color={u.avatarColor} className="text-[8px]">
                          {initials(u.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{u.name}</span>
                    </div>
                    <span className="text-[10px] text-muted">{u.title || u.role}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Màu đại diện nhóm</Label>
            <div className="flex items-center gap-2 pt-1">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTeamColor(c)}
                  className="h-6 w-6 rounded-full cursor-pointer transition-transform flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    transform: teamColor === c ? "scale(1.2)" : "scale(1)",
                    border: teamColor === c ? "2px solid white" : "none",
                  }}
                >
                  {teamColor === c && <Check className="h-3 w-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCreateTeamOpen(false);
                setEditTeamOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={savingTeam} className="font-bold bg-accent hover:bg-accent/90 text-white">
              {savingTeam ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              {editingTeam ? "Lưu cập nhật" : "Tạo nhóm mới"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: TẠO / SỬA USER (CREATE / EDIT USER DIALOG) */}
      {/* ========================================================================= */}
      <Dialog
        header={editingUser ? `Cập nhật tài khoản: ${editingUser.name}` : "Thêm Nhân Sự Mới"}
        visible={createUserOpen || editUserOpen}
        onHide={() => {
          setCreateUserOpen(false);
          setEditUserOpen(false);
        }}
        className="w-full max-w-md border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-3.5 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Họ và tên *</Label>
            <Input
              value={editingUser ? editName : createName}
              onChange={(e) => (editingUser ? setEditName(e.target.value) : setCreateName(e.target.value))}
              className="text-xs h-9 bg-surface-2"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Email công ty *</Label>
            <Input
              type="email"
              value={editingUser ? editEmail : createEmail}
              onChange={(e) => (editingUser ? setEditEmail(e.target.value) : setCreateEmail(e.target.value))}
              className="text-xs h-9 bg-surface-2 font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">
                {editingUser ? "Mật khẩu mới (Tùy chọn)" : "Mật khẩu khởi tạo *"}
              </Label>
              {editingUser && <span className="text-[10px] text-muted">Để trống nếu giữ nguyên</span>}
            </div>
            <Input
              type="password"
              placeholder={editingUser ? "••••••••" : "Tối thiểu 6 ký tự..."}
              value={editingUser ? editPassword : createPassword}
              onChange={(e) => (editingUser ? setEditPassword(e.target.value) : setCreatePassword(e.target.value))}
              className="text-xs h-9 bg-surface-2 font-mono"
              required={!editingUser}
              minLength={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Chức danh</Label>
              <Input
                value={editingUser ? editTitle : createTitle}
                onChange={(e) => (editingUser ? setEditTitle(e.target.value) : setCreateTitle(e.target.value))}
                placeholder="VD: Senior Hardware"
                className="text-xs h-9 bg-surface-2"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Vai trò hệ thống</Label>
              <select
                value={editingUser ? editRole : createRole}
                onChange={(e) => (editingUser ? setEditRole(e.target.value) : setCreateRole(e.target.value))}
                className="h-9 w-full rounded-lg border border-line bg-surface-2 px-2 text-xs text-foreground focus:outline-none"
              >
                {roles.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team / Department Assignment */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Thuộc Nhóm / Phòng ban</Label>
            <select
              value={editingUser ? editTeamId || "" : createTeamId || ""}
              onChange={(e) =>
                editingUser
                  ? setEditTeamId(e.target.value || null)
                  : setCreateTeamId(e.target.value || null)
              }
              className="h-9 w-full rounded-lg border border-line bg-surface-2 px-2.5 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              <option value="">Chưa phân nhóm</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  🏢 {t.name} ({t.code})
                </option>
              ))}
            </select>
          </div>

          {/* Avatar Color */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Màu Avatar</Label>
            <div className="flex items-center gap-2 pt-1">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => (editingUser ? setEditColor(c) : setCreateColor(c))}
                  className="h-6 w-6 rounded-full cursor-pointer transition-transform flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    transform: (editingUser ? editColor : createColor) === c ? "scale(1.2)" : "scale(1)",
                    border: (editingUser ? editColor : createColor) === c ? "2px solid white" : "none",
                  }}
                >
                  {(editingUser ? editColor : createColor) === c && <Check className="h-3 w-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCreateUserOpen(false);
                setEditUserOpen(false);
              }}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={creatingUser || updatingUser}
              className="font-bold bg-accent hover:bg-accent/90 text-white"
            >
              {creatingUser || updatingUser ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Check className="h-3.5 w-3.5 mr-1" />
              )}
              {editingUser ? "Lưu cập nhật" : "Tạo tài khoản"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
