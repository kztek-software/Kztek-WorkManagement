"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  LayoutDashboard,
  KanbanSquare,
  Edit2,
  Trash2,
  Check,
  ChevronDown,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowUpDown,
  UserCheck,
  Crown,
  Loader2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { PROJECT_STATUSES, projectStatusMeta } from "@/lib/constants";
import { MemberDialog } from "@/components/project/member-dialog";
import { Tooltip } from "@/components/ui/tooltip";

type AdminProjectItem = {
  id: string;
  name: string;
  key: string;
  description: string | null;
  status: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    avatarColor: string;
    title: string | null;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  members: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarColor: string;
      title: string | null;
      role: string;
      teamId: string | null;
      team?: { id: string; name: string; code: string; color: string } | null;
    };
  }[];
  teams: { id: string; name: string; code: string; color: string }[];
  metrics: {
    totalTasks: number;
    doneTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    totalPoints: number;
    completionRate: number;
    ticketCount: number;
    sprintCount: number;
  };
};

type UserLiteItem = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  title: string | null;
  role: string;
};

const PROJECT_GRADIENTS = [
  "from-orange-500 to-amber-600",
  "from-blue-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-600 to-pink-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
];

function getProjectGradient(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROJECT_GRADIENTS.length;
  return PROJECT_GRADIENTS[index];
}

export default function AllProjectsManagementPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const currentProjectId = params.projectId;
  const toast = useRef<Toast>(null);

  const [projects, setProjects] = useState<AdminProjectItem[]>([]);
  const [allUsers, setAllUsers] = useState<UserLiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"createdAt_desc" | "createdAt_asc" | "name_asc" | "tasks_desc">("createdAt_desc");

  // Status changing state per project
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<AdminProjectItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editKey, setEditKey] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("PLANNING");
  const [editOwnerId, setEditOwnerId] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<AdminProjectItem | null>(null);
  const [confirmKeyInput, setConfirmKeyInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Member Management Dialog State
  const [memberDialogProjectId, setMemberDialogProjectId] = useState<string | null>(null);

  async function loadProjectsData() {
    setLoading(true);
    try {
      const [resProjects, resUsers] = await Promise.all([
        fetch("/api/admin/projects"),
        fetch("/api/users"),
      ]);

      if (resProjects.status === 403) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      if (resProjects.ok) {
        const data = await resProjects.json();
        setProjects(data.projects || []);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }

      if (resUsers.ok) {
        const uData = await resUsers.json();
        setAllUsers(uData.users || []);
      }
    } catch {
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjectsData();
  }, []);

  // Thay đổi trạng thái nhanh trực tiếp
  async function handleQuickStatusChange(projectId: string, newStatus: string) {
    setActiveDropdownId(null);
    setUpdatingStatusId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
        toast.current?.show({
          severity: "success",
          summary: "Thành công",
          detail: "Đã cập nhật trạng thái dự án",
          life: 2500,
        });
      } else {
        const err = await res.json().catch(() => null);
        toast.current?.show({
          severity: "error",
          summary: "Lỗi",
          detail: err?.error || "Không thể cập nhật trạng thái",
          life: 3000,
        });
      }
    } finally {
      setUpdatingStatusId(null);
    }
  }

  // Mở modal sửa dự án
  function openEditModal(project: AdminProjectItem) {
    setEditingProject(project);
    setEditName(project.name);
    setEditKey(project.key);
    setEditDesc(project.description || "");
    setEditStatus(project.status || "PLANNING");
    setEditOwnerId(project.ownerId);
    setEditError("");
    setEditModalOpen(true);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProject) return;
    setSavingEdit(true);
    setEditError("");

    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          key: editKey.trim().toUpperCase(),
          description: editDesc.trim() || null,
          status: editStatus,
          ownerId: editOwnerId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Không thể lưu thông tin dự án");
        return;
      }

      toast.current?.show({
        severity: "success",
        summary: "Thành công",
        detail: "Đã cập nhật thông tin dự án thành công",
        life: 2500,
      });

      setEditModalOpen(false);
      loadProjectsData();
    } catch {
      setEditError("Lỗi kết nối máy chủ");
    } finally {
      setSavingEdit(false);
    }
  }

  // Mở modal xóa dự án
  function openDeleteModal(project: AdminProjectItem) {
    setDeletingProject(project);
    setConfirmKeyInput("");
    setDeleteModalOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingProject) return;
    if (confirmKeyInput !== deletingProject.key) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.current?.show({
          severity: "success",
          summary: "Đã xóa dự án",
          detail: `Dự án ${deletingProject.name} đã được xóa vĩnh viễn`,
          life: 3000,
        });
        setDeleteModalOpen(false);
        setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));

        // Nếu xóa đúng project đang active thì chuyển về home
        if (deletingProject.id === currentProjectId) {
          router.push("/");
        }
      } else {
        const err = await res.json().catch(() => null);
        toast.current?.show({
          severity: "error",
          summary: "Lỗi xóa dự án",
          detail: err?.error || "Không thể xóa dự án",
          life: 3000,
        });
      }
    } finally {
      setDeleting(false);
    }
  }

  // Thu thập danh sách all teams từ projects
  const allAvailableTeams = useMemo(() => {
    const map = new Map<string, { id: string; name: string; code: string; color: string }>();
    projects.forEach((p) => {
      p.teams.forEach((t) => map.set(t.id, t));
    });
    return Array.from(map.values());
  }, [projects]);

  // Lọc và sắp xếp projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        // Tìm kiếm
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchKey = p.key.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q) || false;
          const matchOwner = p.owner?.name.toLowerCase().includes(q) || false;
          if (!matchName && !matchKey && !matchDesc && !matchOwner) return false;
        }

        // Lọc trạng thái
        if (statusFilter !== "ALL" && p.status !== statusFilter) return false;

        // Lọc phòng ban
        if (teamFilter !== "ALL") {
          const hasTeam = p.teams.some((t) => t.id === teamFilter);
          if (!hasTeam) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "createdAt_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "createdAt_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "name_asc") return a.name.localeCompare(b.name);
        if (sortBy === "tasks_desc") return b.metrics.totalTasks - a.metrics.totalTasks;
        return 0;
      });
  }, [projects, searchQuery, statusFilter, teamFilter, sortBy]);

  // Thống kê số liệu hệ thống
  const stats = useMemo(() => {
    const total = projects.length;
    const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length;
    const planning = projects.filter((p) => p.status === "PLANNING").length;
    const onHold = projects.filter((p) => p.status === "ON_HOLD").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const totalMembers = new Set(projects.flatMap((p) => p.members.map((m) => m.user.id))).size;
    const totalTasks = projects.reduce((sum, p) => sum + p.metrics.totalTasks, 0);

    return { total, inProgress, planning, onHold, completed, totalMembers, totalTasks };
  }, [projects]);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <div className="text-xs font-semibold text-muted">
          Đang tải danh mục tất cả dự án hệ thống...
        </div>
      </div>
    );
  }

  // MÀN HÌNH BẢO VỆ PHÂN QUYỀN 403
  if (isAuthorized === false) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6">
        <div className="rounded-3xl border border-red-500/30 bg-surface p-8 max-w-md text-center space-y-4 shadow-2xl">
          <div className="h-16 w-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
            <ShieldAlert className="h-9 w-9 stroke-[2]" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-base font-bold text-foreground">Từ Chối Truy Cập (403 Forbidden)</h1>
            <p className="text-xs text-muted leading-relaxed">
              Bạn không có quyền Quản trị viên (ADMIN) để xem và quản lý toàn bộ các dự án trên hệ thống. Tài khoản của bạn chỉ có thể truy cập các dự án mà bạn được chỉ định tham gia.
            </p>
          </div>
          <div className="pt-2">
            <Link href={`/projects/${currentProjectId}/dashboard`}>
              <Button className="font-bold bg-accent hover:bg-accent/90 text-white text-xs w-full">
                <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" /> Trở về Dashboard Dự Án Của Bạn
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      <Toast ref={toast} />

      {/* Top Bar Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6 bg-surface/50 backdrop-blur-md gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-xs shrink-0">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground truncate">
                Quản Lý Tất Cả Dự Án Hệ Thống
              </h1>
              <span className="rounded bg-accent/20 border border-accent/40 px-1.5 py-0.2 text-[9px] font-black text-accent">
                ADMIN ONLY
              </span>
            </div>
            <div className="text-[11px] text-muted truncate">
              Tổng quan, điều phối phân quyền và kiểm soát toàn bộ dự án KZTEK
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Tooltip content="Làm mới và tải lại danh sách dự án" side="bottom">
            <Button
              size="sm"
              variant="outline"
              onClick={loadProjectsData}
              className="h-8.5 text-xs font-semibold border-line bg-surface hover:bg-surface-2"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1 text-muted" /> Làm mới
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-[1700px] w-full mx-auto">
        {/* ========================================================================= */}
        {/* ROW 1: 4 SYSTEM KPI METRIC CARDS                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Tổng số dự án</span>
              <FolderKanban className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-foreground">{stats.total}</span>
              <span className="text-xs text-muted font-medium">{stats.totalMembers} nhân sự</span>
            </div>
            <div className="mt-2 text-[10px] text-muted flex items-center gap-1">
              <span>Toàn bộ dự án đã khởi tạo trên hệ thống</span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Đang thực hiện</span>
              <Briefcase className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{stats.inProgress}</span>
              <span className="text-xs text-emerald-400/80 font-bold">
                {stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0}% tổng dự án
              </span>
            </div>
            <div className="mt-2 text-[10px] text-muted">
              Đang hoạt động và có task đang chạy
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Lên kế hoạch / Tạm dừng</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">{stats.planning + stats.onHold}</span>
              <span className="text-xs text-muted font-medium">
                {stats.planning} chuẩn bị • {stats.onHold} dừng
              </span>
            </div>
            <div className="mt-2 text-[10px] text-muted">
              Cần phân bổ thêm nguồn lực hoặc chờ triển khai
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Dự án hoàn thành</span>
              <CheckCircle2 className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-purple-400">{stats.completed}</span>
              <span className="text-xs text-muted font-medium">
                {stats.totalTasks} tasks hệ thống
              </span>
            </div>
            <div className="mt-2 text-[10px] text-muted">
              Đã nghiệm thu và bàn giao thành công
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: MULTI-FILTER TOOLBAR                                               */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
              <input
                type="text"
                placeholder="Tìm kiếm dự án theo tên, mã key, mô tả hoặc chủ dự án..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 rounded-xl border border-line bg-surface-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
              />
              {searchQuery && (
                <Tooltip content="Xóa từ khóa tìm kiếm" side="left">
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-surface-2 rounded-xl border border-line px-2.5 py-1">
                <span className="text-[10px] text-muted font-bold uppercase">Trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả ({projects.length})</option>
                  {PROJECT_STATUSES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1.5 bg-surface-2 rounded-xl border border-line px-2.5 py-1">
                <span className="text-[10px] text-muted font-bold uppercase">Phòng ban:</span>
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả phòng ban</option>
                  {allAvailableTeams.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1.5 bg-surface-2 rounded-xl border border-line px-2.5 py-1">
                <span className="text-[10px] text-muted font-bold uppercase">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="createdAt_desc">Mới nhất trước</option>
                  <option value="createdAt_asc">Cũ nhất trước</option>
                  <option value="name_asc">Tên A-Z</option>
                  <option value="tasks_desc">Nhiều task nhất</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 3: ALL PROJECTS DATA TABLE                                           */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface-2/40">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-accent" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Danh sách dự án ({filteredProjects.length} / {projects.length})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/60 text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Thông tin dự án</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5">Chủ dự án (Owner)</th>
                  <th className="px-4 py-3.5">Phòng ban & Nhân sự</th>
                  <th className="px-4 py-3.5 text-center">Tiến độ & Task</th>
                  <th className="px-5 py-3.5 text-right">Hành động quản trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredProjects.map((p) => {
                  const sMeta = projectStatusMeta(p.status);
                  const isDropdownOpen = activeDropdownId === p.id;
                  const isUpdatingStatus = updatingStatusId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-surface-2/50 transition-colors group">
                      {/* Column 1: Project Info */}
                      <td className="px-5 py-4 font-medium text-foreground">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono font-bold text-xs text-white shadow-sm bg-gradient-to-br ${getProjectGradient(
                              p.key
                            )}`}
                          >
                            {p.key.slice(0, 3)}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-foreground text-xs truncate flex items-center gap-1.5">
                              <span>{p.name}</span>
                              <span className="font-mono text-[10px] text-accent bg-accent/15 px-1.5 py-0.1 rounded border border-accent/30 font-bold">
                                {p.key}
                              </span>
                            </div>
                            <div className="text-[11px] text-muted truncate mt-0.5">
                              {p.description || "Chưa có mô tả mục tiêu"}
                            </div>
                            <div className="text-[10px] text-muted/80 font-mono mt-0.5">
                              Tạo ngày: {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Status with Inline Dropdown Switcher */}
                      <td className="px-4 py-4">
                        <div className="relative inline-block">
                          <button
                            type="button"
                            onClick={() => setActiveDropdownId(isDropdownOpen ? null : p.id)}
                            disabled={isUpdatingStatus}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:opacity-90 border"
                            style={{
                              backgroundColor: sMeta.bg,
                              color: sMeta.color,
                              borderColor: sMeta.border,
                            }}
                          >
                            {isUpdatingStatus ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sMeta.color }} />
                            )}
                            <span>{sMeta.label}</span>
                            <ChevronDown className="h-3 w-3 opacity-70" />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-48 rounded-2xl border border-white/15 bg-[#131826] p-1.5 shadow-2xl backdrop-blur-2xl animate-fade-in-up">
                              <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-muted border-b border-line/50 mb-1">
                                Đổi trạng thái
                              </div>
                              {PROJECT_STATUSES.map((st) => (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => handleQuickStatusChange(p.id, st.id)}
                                  className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                    p.status === st.id ? "bg-surface-2 font-bold" : "hover:bg-surface-2/60 text-muted hover:text-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: st.color }} />
                                    <span style={{ color: st.color }}>{st.label}</span>
                                  </div>
                                  {p.status === st.id && <Check className="h-3.5 w-3.5 text-accent" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 3: Owner */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-7 w-7 text-[10px] shrink-0 border border-white/10">
                            <AvatarFallback color={p.owner?.avatarColor || "#F05922"}>
                              {initials(p.owner?.name || "AD")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-bold text-foreground text-xs truncate flex items-center gap-1">
                              <span>{p.owner?.name || "Chưa gán"}</span>
                              <Crown className="h-3 w-3 text-amber-400 shrink-0" />
                            </div>
                            <div className="text-[10px] text-muted truncate font-mono">
                              {p.owner?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Teams & Members */}
                      <td className="px-4 py-4">
                        <div className="space-y-1.5 max-w-[200px]">
                          {/* Teams Badges */}
                          <div className="flex flex-wrap gap-1">
                            {p.teams.map((tm) => (
                              <span
                                key={tm.id}
                                className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold"
                                style={{
                                  backgroundColor: `${tm.color}20`,
                                  color: tm.color,
                                  border: `1px solid ${tm.color}35`,
                                }}
                              >
                                {tm.name}
                              </span>
                            ))}
                            {p.teams.length === 0 && (
                              <span className="text-[10px] text-muted italic">Chưa gán phòng ban</span>
                            )}
                          </div>

                          {/* Member count */}
                          <div className="text-[10px] text-muted flex items-center gap-1 font-medium">
                            <Users className="h-3 w-3 text-accent" />
                            <span>{p.memberCount} thành viên tham gia</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 5: Progress & Task Metrics */}
                      <td className="px-4 py-4 text-center">
                        <div className="space-y-1 max-w-[130px] mx-auto">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-emerald-400">
                              {p.metrics.doneTasks}/{p.metrics.totalTasks} tasks
                            </span>
                            <span className="font-bold text-foreground">
                              {p.metrics.completionRate}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden border border-line">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${p.metrics.completionRate}%` }}
                            />
                          </div>
                          <div className="text-[9px] text-muted flex items-center justify-between">
                            <span>{p.metrics.totalPoints} pts</span>
                            <span>{p.metrics.ticketCount} tickets</span>
                          </div>
                        </div>
                      </td>

                      {/* Column 6: Admin Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Dashboard Link */}
                          <Tooltip content="Mở Dashboard phân tích & chỉ số" side="top">
                            <Link href={`/projects/${p.id}/dashboard`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7.5 w-7.5 p-0 text-muted hover:text-accent hover:bg-accent/15 cursor-pointer"
                              >
                                <LayoutDashboard className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </Tooltip>

                          {/* Board Link */}
                          <Tooltip content="Mở bảng công việc (Board Kanban)" side="top">
                            <Link href={`/projects/${p.id}/board`}>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7.5 w-7.5 p-0 text-muted hover:text-accent hover:bg-accent/15 cursor-pointer"
                              >
                                <KanbanSquare className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </Tooltip>

                          {/* Manage Members Modal Button */}
                          <Tooltip content="Quản lý thành viên & phân quyền" side="top">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setMemberDialogProjectId(p.id)}
                              className="h-7.5 w-7.5 p-0 text-muted hover:text-emerald-400 hover:bg-emerald-950/20 cursor-pointer"
                            >
                              <Users className="h-3.5 w-3.5" />
                            </Button>
                          </Tooltip>

                          {/* Edit Project Button */}
                          <Tooltip content="Chỉnh sửa thông tin & chuyển giao chủ dự án" side="top">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditModal(p)}
                              className="h-7.5 w-7.5 p-0 text-muted hover:text-blue-400 hover:bg-blue-950/20 cursor-pointer"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          </Tooltip>

                          {/* Delete Project Button */}
                          <Tooltip content="Xóa dự án khỏi hệ thống" side="top">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openDeleteModal(p)}
                              className="h-7.5 w-7.5 p-0 text-muted hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted text-xs">
                      Không tìm thấy dự án nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CHỈNH SỬA DỰ ÁN & CHUYỂN GIAO CHỦ DỰ ÁN                          */}
      {/* ========================================================================= */}
      <Dialog
        header="Chỉnh Sửa Thông Tin Dự Án"
        visible={editModalOpen}
        onHide={() => setEditModalOpen(false)}
        className="w-full max-w-lg border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
          {editError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400 font-medium">
              {editError}
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tên dự án *</Label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="text-xs h-9 bg-surface-2"
              required
              minLength={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Mã Key dự án *</Label>
              <Input
                value={editKey}
                onChange={(e) => setEditKey(e.target.value.toUpperCase())}
                className="text-xs h-9 bg-surface-2 font-mono uppercase"
                required
                minLength={2}
                maxLength={6}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Trạng thái dự án</Label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full h-9 rounded-xl border border-line bg-surface-2 px-3 text-xs text-foreground focus:outline-none"
              >
                {PROJECT_STATUSES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chuyển giao Chủ dự án */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Chủ dự án (Owner)</Label>
              <span className="text-[10px] text-amber-400 font-medium">Toàn quyền quản trị dự án</span>
            </div>
            <select
              value={editOwnerId}
              onChange={(e) => setEditOwnerId(e.target.value)}
              className="w-full h-9 rounded-xl border border-line bg-surface-2 px-3 text-xs text-foreground focus:outline-none cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) {u.title ? `— ${u.title}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Mô tả mục tiêu dự án</Label>
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
              className="text-xs bg-surface-2"
              placeholder="Mô tả phạm vi và mục tiêu triển khai..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={savingEdit}
              className="font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
            >
              {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 2: XÓA DỰ ÁN AN TOÀN (YÊU CẦU NHẬP MÃ KEY XÁC NHẬN)                */}
      {/* ========================================================================= */}
      <Dialog
        header="Xác Nhận Xóa Dự Án Vĩnh Viễn"
        visible={deleteModalOpen}
        onHide={() => setDeleteModalOpen(false)}
        className="w-full max-w-md border border-red-500/40 bg-surface rounded-2xl shadow-2xl"
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              CẢNH BÁO NGUY HIỂM: Hành động không thể hoàn tác!
            </div>
            <p>
              Toàn bộ Board công việc, {deletingProject?.metrics.totalTasks} nhiệm vụ (tasks), các Sprint và dữ liệu liên quan của dự án <strong>{deletingProject?.name}</strong> sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Để xác nhận, vui lòng gõ chính xác mã Key:{" "}
              <span className="font-mono text-accent font-bold">{deletingProject?.key}</span>
            </Label>
            <Input
              value={confirmKeyInput}
              onChange={(e) => setConfirmKeyInput(e.target.value.toUpperCase())}
              placeholder={`Gõ "${deletingProject?.key}" vào đây`}
              className="text-xs h-9 bg-surface-2 font-mono uppercase"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={deleting || confirmKeyInput !== deletingProject?.key}
              onClick={handleConfirmDelete}
              className="font-bold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
              Xác nhận xóa vĩnh viễn
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL 3: PHÂN QUYỀN & THÀNH VIÊN DỰ ÁN                                    */}
      {/* ========================================================================= */}
      {memberDialogProjectId && (
        <MemberDialog
          projectId={memberDialogProjectId}
          open={!!memberDialogProjectId}
          onOpenChange={(open) => {
            if (!open) {
              setMemberDialogProjectId(null);
              loadProjectsData();
            }
          }}
          onMembersChanged={() => loadProjectsData()}
        />
      )}
    </div>
  );
}
