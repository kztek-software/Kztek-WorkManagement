"use client";

import { useEffect, useState } from "react";
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
  Unlock,
  Layers,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { PermissionCategory } from "@/lib/permissions";

type UserItem = {
  id: string;
  name: string;
  email: string;
  title: string | null;
  avatarColor: string;
  role: string;
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
  "#6366f1",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#ef4444",
  "#14b8a6",
  "#f05922",
  "#251c53",
];

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserRole, setCurrentUserRole] = useState<string>("MEMBER");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "email">("users");

  // Roles & Permissions Matrix State
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [categories, setCategories] = useState<PermissionCategory[]>([]);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("TECH_LEAD");
  const [activePermissions, setActivePermissions] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Create Role Modal State
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [newRoleKey, setNewRoleKey] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [newRoleColor, setNewRoleColor] = useState("#3B82F6");
  const [creatingRole, setCreatingRole] = useState(false);
  const [createRoleError, setCreateRoleError] = useState("");

  // Create User Modal State
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createRole, setCreateRole] = useState("MEMBER");
  const [createColor, setCreateColor] = useState("#6366f1");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit User Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editRole, setEditRole] = useState("MEMBER");
  const [editColor, setEditColor] = useState("#6366f1");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Email Config State
  const [emailNotifyAssign, setEmailNotifyAssign] = useState(true);
  const [emailNotifyStatus, setEmailNotifyStatus] = useState(true);
  const [emailNotifyComment, setEmailNotifyComment] = useState(true);
  const [emailNotifyDue, setEmailNotifyDue] = useState(true);
  const [smtpSaved, setSmtpSaved] = useState(false);

  // Load Users & Current Session
  async function loadUsers() {
    try {
      const [resUsers, resMe, resRoles] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/auth/me"),
        fetch("/api/roles"),
      ]);

      if (resUsers.ok) {
        const d = await resUsers.json();
        setUsers(d.users || []);
      }
      if (resMe.ok) {
        const d = await resMe.json();
        setCurrentUserId(d.user?.id || "");
        setCurrentUserRole(d.user?.role || "MEMBER");
      }
      if (resRoles.ok) {
        const d = await resRoles.json();
        setRoles(d.roles || []);
        setCategories(d.categories || []);
        if (d.roles && d.roles.length > 0) {
          const initial = d.roles.find((r: RoleItem) => r.key === "TECH_LEAD") || d.roles[0];
          setSelectedRoleKey(initial.key);
          setActivePermissions(initial.permissions || []);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Update active permissions when switching selected role
  useEffect(() => {
    const r = roles.find((r) => r.key === selectedRoleKey);
    if (r) {
      setActivePermissions(r.permissions);
      setSaveSuccessMsg("");
    }
  }, [selectedRoleKey, roles]);

  const filteredUsers = users.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchTitle = u.title?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchTitle) return false;
    }
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    return true;
  });

  // Toggle single permission for selected role
  function togglePermission(permKey: string) {
    if (selectedRoleKey === "ADMIN") return; // Admin always full access
    setActivePermissions((prev) =>
      prev.includes(permKey) ? prev.filter((k) => k !== permKey) : [...prev, permKey]
    );
  }

  // Toggle all permissions in a category
  function toggleCategory(cat: PermissionCategory) {
    if (selectedRoleKey === "ADMIN") return;
    const catKeys = cat.permissions.map((p) => p.key);
    const allSelected = catKeys.every((k) => activePermissions.includes(k));

    if (allSelected) {
      setActivePermissions((prev) => prev.filter((k) => !catKeys.includes(k)));
    } else {
      setActivePermissions((prev) => Array.from(new Set([...prev, ...catKeys])));
    }
  }

  // Save Permissions Matrix to Backend
  async function saveRolePermissions() {
    setSavingPermissions(true);
    setSaveSuccessMsg("");
    try {
      const res = await fetch(`/api/roles/${selectedRoleKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: activePermissions }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Không lưu được phân quyền");
        return;
      }

      setRoles((prev) =>
        prev.map((r) => (r.key === selectedRoleKey ? { ...r, permissions: activePermissions } : r))
      );
      setSaveSuccessMsg(`✅ Đã lưu cấu hình phân quyền cho vai trò "${data.role.name}"`);
      setTimeout(() => setSaveSuccessMsg(""), 4000);
    } catch {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setSavingPermissions(false);
    }
  }

  // Create new Custom Role
  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!newRoleKey.trim() || !newRoleName.trim()) return;
    setCreatingRole(true);
    setCreateRoleError("");

    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: newRoleKey.trim().toUpperCase(),
          name: newRoleName.trim(),
          description: newRoleDesc.trim() || undefined,
          color: newRoleColor,
          permissions: [
            "tasks.view",
            "tasks.create",
            "tasks.edit",
            "tasks.move_status",
            "tasks.comment",
            "sprints.view",
            "reports.view_overview",
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateRoleError(data.error ?? "Không tạo được vai trò mới");
        return;
      }

      setRoles((prev) => [...prev, data.role]);
      setSelectedRoleKey(data.role.key);
      setActivePermissions(data.role.permissions);
      setCreateRoleOpen(false);
      setNewRoleKey("");
      setNewRoleName("");
      setNewRoleDesc("");
    } catch {
      setCreateRoleError("Lỗi kết nối máy chủ");
    } finally {
      setCreatingRole(false);
    }
  }

  // Delete Custom Role
  async function handleDeleteRole(role: RoleItem) {
    if (role.isSystem) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${role.name}" (${role.key})? Các thành viên đang giữ vai trò này sẽ tự động chuyển về MEMBER.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/roles/${role.key}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error ?? "Không xóa được vai trò");
        return;
      }

      setRoles((prev) => prev.filter((r) => r.key !== role.key));
      setSelectedRoleKey("MEMBER");
    } catch {
      alert("Lỗi kết nối máy chủ");
    }
  }

  // Create User
  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");

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
          avatarColor: createColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "Không tạo được tài khoản");
        return;
      }

      setCreateOpen(false);
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateTitle("");
      loadUsers();
    } catch {
      setCreateError("Lỗi kết nối máy chủ");
    } finally {
      setCreating(false);
    }
  }

  // Edit User
  function openEditModal(u: UserItem) {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
    setEditTitle(u.title ?? "");
    setEditRole(u.role);
    setEditColor(u.avatarColor);
    setEditError("");
    setEditOpen(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setUpdating(true);
    setEditError("");

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
          avatarColor: editColor,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "Không cập nhật được tài khoản");
        return;
      }

      setEditOpen(false);
      loadUsers();
    } catch {
      setEditError("Lỗi kết nối máy chủ");
    } finally {
      setUpdating(false);
    }
  }

  // Delete User
  async function handleDeleteUser(u: UserItem) {
    if (u.id === currentUserId) {
      alert("Bạn không thể xóa tài khoản của chính mình!");
      return;
    }
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${u.name}" (${u.email})?`)) return;

    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Không xóa được tài khoản");
        return;
      }
      loadUsers();
    } catch {
      alert("Lỗi kết nối");
    }
  }

  const selectedRole = roles.find((r) => r.key === selectedRoleKey);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-xs font-semibold text-muted flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Đang tải dữ liệu người dùng & phân quyền...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header & Tabs */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5 bg-surface/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-foreground text-sm">
            <Shield className="h-4 w-4 text-accent" />
            <span>Quản trị Hệ thống & Phân quyền</span>
          </div>

          <div className="flex items-center rounded-xl bg-surface-2 p-1 border border-line">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "users"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Tài khoản ({users.length})
            </button>

            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "roles"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              Ma trận Phân quyền ({roles.length} vai trò)
            </button>

            <button
              onClick={() => setActiveTab("email")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "email"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              Cấu hình Email & SMTP
            </button>
          </div>
        </div>

        {activeTab === "users" && (
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="h-8 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" /> Thêm tài khoản mới
          </Button>
        )}

        {activeTab === "roles" && (
          <Button
            size="sm"
            onClick={() => setCreateRoleOpen(true)}
            className="h-8 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Thêm vai trò mới
          </Button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH SÁCH TÀI KHOẢN (USERS) */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="flex-1 space-y-4 overflow-y-auto p-5 max-w-7xl mx-auto w-full">
          {/* Filter Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                <Input
                  placeholder="Tìm theo tên, email, chức danh..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-64 pl-8 text-xs bg-surface border-line"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">🛡️ Tất cả vai trò ({users.length})</option>
                {roles.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-muted font-medium">
              Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} tài khoản
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-muted font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Nhân sự</th>
                  <th className="py-3 px-4">Chức danh</th>
                  <th className="py-3 px-4">Vai trò hệ thống</th>
                  <th className="py-3 px-4 text-center">Dự án tham gia</th>
                  <th className="py-3 px-4 text-center">Task phụ trách</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredUsers.map((u) => {
                  const roleDef = roles.find((r) => r.key === u.role);
                  return (
                    <tr key={u.id} className="hover:bg-surface-2/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 border border-white/10 shadow-sm">
                            <AvatarFallback color={u.avatarColor} className="text-xs font-bold">
                              {initials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-bold text-foreground flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.id === currentUserId && (
                                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 text-muted-light font-medium">
                        {u.title || <span className="text-muted/60 italic">—</span>}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight"
                          style={{
                            backgroundColor: `${roleDef?.color || "#6366f1"}20`,
                            color: roleDef?.color || "#6366f1",
                            border: `1px solid ${roleDef?.color || "#6366f1"}40`,
                          }}
                        >
                          <Shield className="h-3 w-3" />
                          {roleDef?.name || u.role}
                        </span>
                      </td>

                      {/* Projects count */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-muted">
                        {u._count.memberships}
                      </td>

                      {/* Tasks count */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-accent">
                        {u._count.assignedTasks}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin / Đổi mật khẩu"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {u.id !== currentUserId && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MA TRẬN PHÂN QUYỀN & VAI TRÒ (ROLES & PERMISSIONS MATRIX) */}
      {/* ========================================================================= */}
      {activeTab === "roles" && (
        <div className="flex-1 overflow-hidden grid grid-cols-[280px_1fr] divide-x divide-line">
          {/* Left Column: Roles Selector List */}
          <div className="p-4 space-y-3 overflow-y-auto bg-surface/30">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Danh sách vai trò ({roles.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {roles.map((r) => {
                const isSelected = r.key === selectedRoleKey;
                return (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRoleKey(r.key)}
                    className={`flex w-full items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-surface-2 border-accent shadow-md ring-1 ring-accent/40"
                        : "bg-surface/60 border-line hover:border-line-strong hover:bg-surface-2/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="h-3 w-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: r.color, boxShadow: `0 0 6px ${r.color}80` }}
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
                      <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[9px] font-bold text-muted">
                        {r.permissions.length} quyền
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 text-muted transition-transform ${isSelected ? "text-accent translate-x-0.5" : ""}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Permission Matrix for Selected Role */}
          <div className="flex flex-col overflow-hidden bg-background">
            {/* Role Header & Action */}
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
                  {selectedRole?.isSystem && (
                    <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                      Vai trò mặc định hệ thống
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted">
                  {selectedRole?.description || "Chưa có mô tả cho vai trò này"}
                </p>

                {saveSuccessMsg && (
                  <p className="text-xs font-semibold text-emerald-400 pt-1 animate-fade-in-up">
                    {saveSuccessMsg}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!selectedRole?.isSystem && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedRole && handleDeleteRole(selectedRole)}
                    className="h-8 text-xs text-red-400 border-red-500/30 hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa vai trò này
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={saveRolePermissions}
                  disabled={savingPermissions || selectedRole?.key === "ADMIN"}
                  className="h-8 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
                >
                  {savingPermissions ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1" />
                  )}
                  Lưu phân quyền
                </Button>
              </div>
            </div>

            {/* Permission Matrix Grid */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {selectedRole?.key === "ADMIN" ? (
                <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-5 text-center space-y-2">
                  <Shield className="h-8 w-8 text-orange-400 mx-auto" />
                  <h3 className="text-sm font-bold text-orange-300">Quản trị viên Cấp cao (ADMIN)</h3>
                  <p className="text-xs text-orange-200/80 max-w-md mx-auto">
                    Tài khoản Quản trị viên (ADMIN) mặc định luôn nắm giữ <strong>100% tất cả các quyền</strong> trong toàn bộ hệ thống để đảm bảo việc quản lý và vận hành không bị gián đoạn.
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => {
                  const catKeys = cat.permissions.map((p) => p.key);
                  const selectedInCat = catKeys.filter((k) => activePermissions.includes(k)).length;
                  const isAll = selectedInCat === catKeys.length;

                  return (
                    <div
                      key={cat.id}
                      className="rounded-2xl border border-line bg-surface p-4 shadow-sm space-y-3"
                    >
                      {/* Category Header */}
                      <div className="flex items-center justify-between border-b border-line pb-2.5">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground">{cat.name}</h4>
                          <p className="text-[10px] text-muted truncate">{cat.description}</p>
                        </div>

                        {selectedRole?.key !== "ADMIN" && (
                          <button
                            type="button"
                            onClick={() => toggleCategory(cat)}
                            className="text-[11px] font-semibold text-accent hover:underline cursor-pointer shrink-0"
                          >
                            {isAll ? "Bỏ chọn hết" : "Chọn tất cả"} ({selectedInCat}/{catKeys.length})
                          </button>
                        )}
                      </div>

                      {/* Permissions List */}
                      <div className="space-y-1.5">
                        {cat.permissions.map((perm) => {
                          const isChecked = activePermissions.includes(perm.key) || selectedRole?.key === "ADMIN";
                          return (
                            <div
                              key={perm.key}
                              onClick={() => togglePermission(perm.key)}
                              className={`flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                                selectedRole?.key === "ADMIN"
                                  ? "cursor-not-allowed opacity-90"
                                  : "hover:bg-surface-2 cursor-pointer"
                              } ${isChecked ? "bg-surface-2/40" : ""}`}
                            >
                              <div className="mt-0.5">
                                {isChecked ? (
                                  <CheckSquare className="h-4 w-4 text-accent shrink-0" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted shrink-0" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-foreground leading-tight">
                                  {perm.name}
                                </div>
                                <div className="text-[10px] text-muted leading-tight mt-0.5">
                                  {perm.description}
                                </div>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CẤU HÌNH EMAIL & SMTP */}
      {/* ========================================================================= */}
      {activeTab === "email" && (
        <div className="flex-1 space-y-6 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
          {/* SMTP Card */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <Mail className="h-5 w-5 text-accent" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Thiết Lập Máy Chủ Gửi Email (SMTP Server)</h2>
                <p className="text-xs text-muted">Cấu hình máy chủ gửi thông báo giao việc và nhắc việc tự động</p>
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
                <Label className="text-xs font-semibold">Email gửi (Sender Email)</Label>
                <Input defaultValue="notifications@kztek.net" className="text-xs h-9 bg-surface-2 font-mono" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-line/60">
              <span className="text-xs text-emerald-400 font-medium">
                {smtpSaved ? "✅ Đã lưu cấu hình máy chủ SMTP thành công!" : "🟢 Máy chủ đang ở chế độ giả lập & ghi log thời gian thực"}
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

          {/* Trigger Toggles */}
          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground">Sự Kiện Kích Hoạt Gửi Email</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface-2/40 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-foreground">Khi được phân công công việc mới</div>
                  <div className="text-[11px] text-muted">Gửi email tức thì khi có người giao task cho bạn</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifyAssign}
                  onChange={(e) => setEmailNotifyAssign(e.target.checked)}
                  className="h-4 w-4 accent-accent cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface-2/40 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-foreground">Khi trạng thái công việc thay đổi</div>
                  <div className="text-[11px] text-muted">Thông báo khi task được kéo sang In Progress, Review hoặc Done</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifyStatus}
                  onChange={(e) => setEmailNotifyStatus(e.target.checked)}
                  className="h-4 w-4 accent-accent cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-line bg-surface-2/40 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-foreground">Khi có bình luận mới trong task của bạn</div>
                  <div className="text-[11px] text-muted">Nhận thông báo khi đồng nghiệp để lại trao đổi trên công việc</div>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifyComment}
                  onChange={(e) => setEmailNotifyComment(e.target.checked)}
                  className="h-4 w-4 accent-accent cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TẠO VAI TRÒ MỚI (CREATE ROLE MODAL) */}
      {/* ========================================================================= */}
      <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent className="max-w-md border border-line bg-surface p-6 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              Tạo Vai Trò Tùy Chỉnh Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Định nghĩa chức danh mới và cấu hình các quyền hạn phù hợp với mô hình nhóm
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRole} className="mt-2 space-y-3.5">
            {createRoleError && (
              <div className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
                {createRoleError}
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tên hiển thị vai trò *</Label>
              <Input
                placeholder="VD: Trưởng nhóm QA (QA Lead), Thiết kế UI..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="text-xs h-9 bg-surface-2"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Mã định danh vai trò (Key in hoa) *</Label>
              <Input
                placeholder="VD: QA_LEAD, DESIGNER, HARDWARE_ENG..."
                value={newRoleKey}
                onChange={(e) => setNewRoleKey(e.target.value.toUpperCase())}
                className="text-xs h-9 bg-surface-2 font-mono uppercase"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Mô tả vai trò</Label>
              <Textarea
                placeholder="Mô tả phạm vi trách nhiệm của vai trò này..."
                value={newRoleDesc}
                onChange={(e) => setNewRoleDesc(e.target.value)}
                rows={2}
                className="text-xs bg-surface-2"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Màu đại diện vai trò</Label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewRoleColor(c)}
                    className="h-6 w-6 rounded-full cursor-pointer transition-transform flex items-center justify-center"
                    style={{
                      backgroundColor: c,
                      transform: newRoleColor === c ? "scale(1.2)" : "scale(1)",
                      border: newRoleColor === c ? "2px solid white" : "none",
                    }}
                  >
                    {newRoleColor === c && <Check className="h-3 w-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateRoleOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={creatingRole} className="font-bold bg-accent hover:bg-accent/90 text-white">
                {creatingRole ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                Tạo vai trò
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: TẠO TÀI KHOẢN MỚI (CREATE USER MODAL) */}
      {/* ========================================================================= */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md border border-line bg-surface p-6 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-accent" />
              Thêm Tài Khoản Nhân Sự Mới
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Khởi tạo thông tin đăng nhập và phân quyền cho nhân viên
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="mt-2 space-y-3.5">
            {createError && (
              <div className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
                {createError}
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Họ và tên nhân sự *</Label>
              <Input
                placeholder="VD: Đặng Văn Dũng"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="text-xs h-9 bg-surface-2"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email công ty *</Label>
              <Input
                type="email"
                placeholder="dung@kztek.net"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                className="text-xs h-9 bg-surface-2 font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Mật khẩu khởi tạo *</Label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự..."
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="text-xs h-9 bg-surface-2 font-mono"
                required
                minLength={6}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Chức danh</Label>
                <Input
                  placeholder="VD: Hardware Lead"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="text-xs h-9 bg-surface-2"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Vai trò hệ thống</Label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="h-9 w-full rounded-lg border border-line bg-surface-2 px-2.5 text-xs text-foreground focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Màu Avatar đại diện</Label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCreateColor(c)}
                    className="h-6 w-6 rounded-full cursor-pointer transition-transform flex items-center justify-center"
                    style={{
                      backgroundColor: c,
                      transform: createColor === c ? "scale(1.2)" : "scale(1)",
                      border: createColor === c ? "2px solid white" : "none",
                    }}
                  >
                    {createColor === c && <Check className="h-3 w-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={creating} className="font-bold bg-accent hover:bg-accent/90 text-white">
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                Tạo tài khoản
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: CHỈNH SỬA TÀI KHOẢN (EDIT USER MODAL) */}
      {/* ========================================================================= */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md border border-line bg-surface p-6 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-accent" />
              Cập Nhật Tài Khoản Nhân Sự
            </DialogTitle>
            <DialogDescription className="text-xs text-muted">
              Chỉnh sửa thông tin chức danh, vai trò hoặc cấp lại mật khẩu
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="mt-2 space-y-3.5">
            {editError && (
              <div className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
                {editError}
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Họ và tên *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xs h-9 bg-surface-2"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email *</Label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="text-xs h-9 bg-surface-2 font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Mật khẩu mới (Tùy chọn)</Label>
                <span className="text-[10px] text-muted">Để trống nếu giữ nguyên</span>
              </div>
              <Input
                type="password"
                placeholder="Nhập mật khẩu mới..."
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="text-xs h-9 bg-surface-2 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Chức danh</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xs h-9 bg-surface-2"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Vai trò hệ thống</Label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="h-9 w-full rounded-lg border border-line bg-surface-2 px-2.5 text-xs text-foreground focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Màu Avatar đại diện</Label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className="h-6 w-6 rounded-full cursor-pointer transition-transform flex items-center justify-center"
                    style={{
                      backgroundColor: c,
                      transform: editColor === c ? "scale(1.2)" : "scale(1)",
                      border: editColor === c ? "2px solid white" : "none",
                    }}
                  >
                    {editColor === c && <Check className="h-3 w-3 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={updating} className="font-bold bg-accent hover:bg-accent/90 text-white">
                {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                Lưu cập nhật
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
