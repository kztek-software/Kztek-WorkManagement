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
} from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeTab, setActiveTab] = useState<"users" | "email">("users");

  // Create User Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createTitle, setCreateTitle] = useState("");
  const [createRole, setCreateRole] = useState("MEMBER");
  const [createColor, setCreateColor] = useState("#6366f1");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit User Modal
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

  async function loadUsers() {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setCurrentUserId(data.currentUserId || "");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim() || !createEmail.trim() || !createPassword.trim()) {
      setCreateError("Vui lòng điền đầy đủ Tên, Email và Mật khẩu");
      return;
    }
    setCreateError("");
    setCreating(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName.trim(),
          email: createEmail.trim(),
          password: createPassword,
          title: createTitle.trim() || null,
          role: createRole,
          avatarColor: createColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "Không thể tạo người dùng");
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

  function openEditModal(user: UserItem) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword("");
    setEditTitle(user.title || "");
    setEditRole(user.role);
    setEditColor(user.avatarColor || "#6366f1");
    setEditError("");
    setEditOpen(true);
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setEditError("");
    setUpdating(true);

    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          password: editPassword.trim() ? editPassword : undefined,
          title: editTitle.trim() || null,
          role: editRole,
          avatarColor: editColor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error ?? "Không thể cập nhật người dùng");
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

  async function handleDeleteUser(user: UserItem) {
    if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" (${user.email})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Không thể xóa người dùng");
        return;
      }
      loadUsers();
    } catch {
      alert("Lỗi kết nối máy chủ");
    }
  }

  const filteredUsers = users.filter((u) => {
    const q = search.trim().toLowerCase();
    if (q && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !(u.title?.toLowerCase().includes(q))) {
      return false;
    }
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent font-bold text-white text-xs shadow-sm">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold flex items-center gap-2">
              Quản lý Người Dùng, Email & Thông Báo Giao Việc
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "users" && (
            <Button size="sm" onClick={() => setCreateOpen(true)} className="h-8 text-xs font-semibold">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Thêm tài khoản mới
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-line bg-surface/50 px-4 pt-2">
        <div className="flex gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === "users"
                ? "border-accent text-accent font-semibold"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Danh sách Tài khoản ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === "email"
                ? "border-accent text-accent font-semibold"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <Mail className="h-3.5 w-3.5" /> Cấu hình Email & Thông báo giao việc
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-6xl mx-auto w-full space-y-4">
        {/* TAB 1: USERS LIST */}
        {activeTab === "users" && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
                  <Input
                    placeholder="Tìm theo tên, email, chức danh..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 w-64 pl-8 text-xs bg-surface"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="h-8 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="MEMBER">Thành viên (MEMBER)</option>
                  <option value="VIEWER">Người xem (VIEWER)</option>
                </select>
              </div>

              <div className="text-xs text-muted">
                Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} tài khoản
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex h-48 items-center justify-center text-xs text-muted">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải danh sách người dùng...
              </div>
            ) : (
              <div className="rounded-xl border border-line bg-surface overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-2 text-muted uppercase text-[10px] font-semibold border-b border-line">
                    <tr>
                      <th className="p-3">Nhân sự</th>
                      <th className="p-3">Chức danh</th>
                      <th className="p-3">Vai trò hệ thống</th>
                      <th className="p-3">Dự án tham gia</th>
                      <th className="p-3">Task phụ trách</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-2/60 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback color={u.avatarColor}>
                                {initials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-foreground flex items-center gap-1.5">
                                {u.name}
                                {u.id === currentUserId && (
                                  <span className="rounded bg-accent/20 px-1.5 py-0.2 text-[9px] font-bold text-accent">
                                    BẠN
                                  </span>
                                )}
                              </div>
                              <div className="text-muted text-[11px] font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-muted">
                          {u.title || "—"}
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              u.role === "ADMIN"
                                ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                                : u.role === "VIEWER"
                                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            <Shield className="h-2.5 w-2.5" />
                            {u.role}
                          </span>
                        </td>

                        <td className="p-3 font-medium text-foreground">
                          {u._count.memberships} dự án
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-accent">{u._count.assignedTasks}</span> task
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(u)}
                              className="h-7 px-2 text-xs text-muted hover:text-foreground"
                              title="Chỉnh sửa & Đổi mật khẩu"
                            >
                              <Edit2 className="h-3 w-3 mr-1" /> Sửa
                            </Button>
                            {u.id !== currentUserId && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(u)}
                                className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EMAIL CONFIG & NOTIFICATION TEMPLATES */}
        {activeTab === "email" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email Notification Triggers */}
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-surface p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4 text-accent" />
                    Bật/Tắt Gửi Email Thông Báo Giao Việc
                  </h3>
                  <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-semibold">
                    Đang hoạt động
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-line cursor-pointer">
                    <div>
                      <div className="font-semibold text-foreground">Giao việc mới (Task Assigned)</div>
                      <div className="text-[11px] text-muted">Gửi email tức thì cho nhân sự khi được giao phụ trách task mới</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifyAssign}
                      onChange={(e) => setEmailNotifyAssign(e.target.checked)}
                      className="h-4 w-4 accent-accent rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-line cursor-pointer">
                    <div>
                      <div className="font-semibold text-foreground">Cập nhật trạng thái (Status Changed)</div>
                      <div className="text-[11px] text-muted">Thông báo khi task được chuyển sang Review, Done hoặc In Progress</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifyStatus}
                      onChange={(e) => setEmailNotifyStatus(e.target.checked)}
                      className="h-4 w-4 accent-accent rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-line cursor-pointer">
                    <div>
                      <div className="font-semibold text-foreground">Bình luận & Thảo luận (New Comment)</div>
                      <div className="text-[11px] text-muted">Thông báo khi có phản hồi mới từ quản lý hoặc đồng nghiệp</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifyComment}
                      onChange={(e) => setEmailNotifyComment(e.target.checked)}
                      className="h-4 w-4 accent-accent rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-surface-2 border border-line cursor-pointer">
                    <div>
                      <div className="font-semibold text-foreground">Nhắc nhở hạn chót (Due Date Alert)</div>
                      <div className="text-[11px] text-muted">Tự động nhắc nhở trước 24h khi task sắp đến hạn bàn giao</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifyDue}
                      onChange={(e) => setEmailNotifyDue(e.target.checked)}
                      className="h-4 w-4 accent-accent rounded"
                    />
                  </label>
                </div>
              </div>

              {/* SMTP Settings */}
              <div className="rounded-xl border border-line bg-surface p-4 space-y-3 text-xs">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  Cấu hình Máy chủ Gửi Mail (SMTP Server)
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px]">SMTP Host</Label>
                    <Input defaultValue="smtp.gmail.com" className="h-8 text-xs bg-surface-2" />
                  </div>
                  <div>
                    <Label className="text-[11px]">Cổng (Port)</Label>
                    <Input defaultValue="587 (TLS)" className="h-8 text-xs bg-surface-2" />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px]">Tên người gửi đại diện (Sender Name)</Label>
                  <Input defaultValue="KZTEK Work Management <notification@kztek.net>" className="h-8 text-xs bg-surface-2" />
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSmtpSaved(true);
                      setTimeout(() => setSmtpSaved(false), 2500);
                    }}
                    className="h-7 text-xs font-semibold"
                  >
                    Lưu cấu hình SMTP
                  </Button>
                  {smtpSaved && (
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Đã lưu cấu hình!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Email Template Preview */}
            <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4 text-accent" />
                  Xem trước Mẫu Email Thông Báo Giao Việc (Email Template)
                </h3>
                <span className="rounded bg-accent/15 text-accent px-2 py-0.5 text-[10px] font-semibold">
                  KZTEK Theme
                </span>
              </div>

              {/* Email Mockup */}
              <div className="rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 p-5 space-y-4 text-xs font-sans shadow-lg">
                {/* Header */}
                <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-[#F05922] flex items-center justify-center font-bold text-white text-[10px]">
                      KZ
                    </div>
                    <span className="font-bold text-sm text-white tracking-wide">KZTEK WORK</span>
                  </div>
                  <span className="text-[10px] text-neutral-400">Thông báo tự động</span>
                </div>

                {/* Body */}
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-white">
                    Xin chào <strong>Binh Tran</strong>,
                  </p>
                  <p className="text-neutral-300 leading-relaxed">
                    Bạn vừa được quản lý <strong>Alice Nguyen</strong> giao phụ trách một công việc mới trên hệ thống <strong>KZTEK Work Management</strong>:
                  </p>

                  <div className="rounded-lg bg-neutral-800/80 p-3.5 border border-neutral-700 space-y-2">
                    <div className="text-sm font-bold text-[#F05922]">
                      [FB-18] Tích hợp bộ đọc thẻ RFID & Barrier kiểm soát cổng
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
                      <div>Dự án: <strong>Hệ Thống Bãi Xe Thông Minh</strong></div>
                      <div>Mức độ: <span className="text-red-400 font-bold">Khẩn cấp (URGENT)</span></div>
                      <div>Hạn chót: <strong>25/08/2026</strong></div>
                      <div>Story points: <strong>8 pts</strong></div>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-2 text-center">
                  <div className="inline-block rounded-lg bg-[#F05922] px-5 py-2 text-xs font-bold text-white shadow-md">
                    Xem chi tiết & Cập nhật tiến độ trên Board →
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-neutral-800 pt-3 text-center text-[10px] text-neutral-500">
                  © 2026 KZTEK Inc. Email được gửi tự động từ máy chủ KZTEK Work Management.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-accent" />
              Thêm Tài Khoản Người Dùng Mới
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tạo tài khoản mới để phân quyền và giao việc trên hệ thống KZTEK
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-3 pt-2">
            {createError && (
              <div className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
                {createError}
              </div>
            )}

            <div>
              <Label className="text-xs">Họ và tên *</Label>
              <Input
                placeholder="VD: Nguyễn Văn An"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="text-xs mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-xs">Email đăng nhập *</Label>
              <Input
                type="email"
                placeholder="an.nv@kztek.net"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                className="text-xs mt-1 font-mono"
                required
              />
            </div>

            <div>
              <Label className="text-xs">Mật khẩu khởi tạo *</Label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="text-xs mt-1 font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Chức danh / Vị trí</Label>
                <Input
                  placeholder="VD: Senior Embedded Dev"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Vai trò hệ thống</Label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="w-full h-9 mt-1 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="MEMBER">Thành viên (MEMBER)</option>
                  <option value="VIEWER">Người xem (VIEWER)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Màu đại diện (Avatar)</Label>
              <div className="flex gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCreateColor(c)}
                    className="h-6 w-6 rounded-full transition-transform cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: c }}
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
              <Button type="submit" size="sm" disabled={creating}>
                {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Tạo tài khoản
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT USER MODAL */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit2 className="h-4 w-4 text-accent" />
              Chỉnh Sửa Tài Khoản: {editingUser?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cập nhật thông tin, vai trò hệ thống hoặc đổi mật khẩu
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateUser} className="space-y-3 pt-2">
            {editError && (
              <div className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
                {editError}
              </div>
            )}

            <div>
              <Label className="text-xs">Họ và tên</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xs mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="text-xs mt-1 font-mono"
                required
              />
            </div>

            <div>
              <Label className="text-xs">Mật khẩu mới (Để trống nếu không đổi)</Label>
              <Input
                type="password"
                placeholder="Nhập mật khẩu mới..."
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="text-xs mt-1 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Chức danh</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs">Vai trò hệ thống</Label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full h-9 mt-1 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="MEMBER">Thành viên (MEMBER)</option>
                  <option value="VIEWER">Người xem (VIEWER)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Màu đại diện (Avatar)</Label>
              <div className="flex gap-2">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className="h-6 w-6 rounded-full transition-transform cursor-pointer flex items-center justify-center"
                    style={{ backgroundColor: c }}
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
              <Button type="submit" size="sm" disabled={updating}>
                {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
