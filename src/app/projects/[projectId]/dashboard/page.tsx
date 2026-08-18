"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Briefcase,
  Users,
  Building2,
  Rocket,
  LifeBuoy,
  KanbanSquare,
  ChevronRight,
  TrendingUp,
  Activity,
  Calendar,
  Sparkles,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Sliders,
  Check,
} from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUSES, projectStatusMeta } from "@/lib/constants";
import { canManageMembers } from "@/lib/permissions";
import type { ProjectDashboardData } from "@/lib/types";

const tooltipStyle = {
  backgroundColor: "#181E2E",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: 12,
  fontSize: 12,
  color: "#F1F4F9",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
  padding: "8px 12px",
};

export default function ProjectDashboardPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  const [data, setData] = useState<ProjectDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/dashboard`);
      const json = await res.json().catch(() => null);
      if (res.ok && json) {
        setData(json);
      } else {
        setErrorMsg(json?.error || "Không thể tải dữ liệu Dashboard dự án");
      }
    } catch {
      setErrorMsg("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleStatusChange(newStatus: string) {
    if (!data) return;
    setUpdatingStatus(true);
    setStatusMenuOpen(false);

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                project: { ...prev.project, status: newStatus },
              }
            : prev
        );
        router.refresh();
      }
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background gap-3">
        <div className="h-6 w-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <div className="text-xs font-semibold text-muted">
          Đang tổng hợp dữ liệu Dashboard dự án...
        </div>
      </div>
    );
  }

  if (!data || errorMsg) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6 gap-3">
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 max-w-md text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto" />
          <div className="text-sm font-bold text-foreground">
            {errorMsg || "Không thể tải dữ liệu Dashboard dự án"}
          </div>
          <div className="text-xs text-muted">
            Vui lòng kiểm tra quyền truy cập dự án hoặc nhấn nút bên dưới để thử lại.
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              size="sm"
              onClick={loadDashboard}
              className="text-xs font-bold bg-accent hover:bg-accent/90 text-white"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Thử lại
            </Button>
            <Link href={`/projects/${projectId}/board`}>
              <Button size="sm" variant="outline" className="text-xs font-semibold border-line">
                <KanbanSquare className="h-3.5 w-3.5 mr-1" /> Mở Board Công Việc
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { project, summary, activeSprint, statusDistribution, priorityDistribution, memberWorkloads, teamBreakdown, urgentAndOverdueTasks, recentActivities, ticketStats, currentRole } = data;
  const currentStatusMeta = projectStatusMeta(project.status);
  const hasManageRight = canManageMembers(currentRole);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Top Bar Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6 bg-surface/50 backdrop-blur-md gap-4">
        {/* Project Breadcrumbs & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 border border-accent/30 text-accent font-bold text-xs shrink-0">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground truncate">{project.name}</h1>
              <span className="text-[11px] font-mono text-muted bg-surface-2 px-1.5 py-0.2 rounded border border-line">
                {project.key}
              </span>
            </div>
            <div className="text-[11px] text-muted truncate">
              {project.description || "Trung tâm điều phối & phân tích chỉ số dự án KZTEK"}
            </div>
          </div>
        </div>

        {/* Project Status Selector & Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Dropdown Selector */}
          <div className="relative">
            {hasManageRight ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStatusMenuOpen((v) => !v)}
                  disabled={updatingStatus}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: currentStatusMeta.bg,
                    color: currentStatusMeta.color,
                    borderColor: currentStatusMeta.border,
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: currentStatusMeta.color }} />
                  <span>Trạng thái: {currentStatusMeta.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 rotate-90 opacity-70" />
                </button>

                {statusMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-56 rounded-2xl border border-white/15 bg-[#131826] p-1.5 shadow-2xl backdrop-blur-2xl animate-fade-in-up">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line/50 mb-1">
                      Cập nhật trạng thái dự án
                    </div>
                    {PROJECT_STATUSES.map((st) => {
                      const isCurrent = project.status === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => handleStatusChange(st.id)}
                          className={`flex w-full items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                            isCurrent ? "bg-surface-2 font-bold" : "hover:bg-surface-2/60 text-muted hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: st.color }} />
                            <span style={{ color: st.color }}>{st.label}</span>
                          </div>
                          {isCurrent && <Check className="h-3.5 w-3.5 text-accent" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-sm"
                style={{
                  backgroundColor: currentStatusMeta.bg,
                  color: currentStatusMeta.color,
                  borderColor: currentStatusMeta.border,
                }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: currentStatusMeta.color }} />
                <span>{currentStatusMeta.label}</span>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={loadDashboard}
            className="h-8.5 text-xs font-semibold border-line bg-surface hover:bg-surface-2"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-muted" /> Làm mới
          </Button>

          <Link href={`/projects/${projectId}/board`}>
            <Button size="sm" className="h-8.5 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25">
              <KanbanSquare className="h-3.5 w-3.5 mr-1" /> Mở Board
            </Button>
          </Link>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-[1700px] w-full mx-auto">
        {/* ========================================================================= */}
        {/* ROW 1: 5 CORE KPI METRIC CARDS                                           */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* KPI 1: Completion Progress */}
          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Tiến độ công việc</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-emerald-400">{summary.completionRate}%</span>
              <span className="text-xs text-muted font-medium">
                {summary.doneTasks}/{summary.totalTasks} tasks
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${summary.completionRate}%` }} />
            </div>
          </div>

          {/* KPI 2: Story Points Delivered */}
          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Story Points</span>
              <Briefcase className="h-4 w-4 text-accent" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-accent">{summary.doneStoryPoints}</span>
              <span className="text-xs text-muted font-medium">
                / {summary.totalStoryPoints} pts ({summary.pointsCompletionRate}%)
              </span>
            </div>
            <div className="mt-2.5 h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${summary.pointsCompletionRate}%` }} />
            </div>
          </div>

          {/* KPI 3: In Progress & In Review */}
          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Đang thực hiện</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-amber-400">{summary.inProgressTasks + summary.inReviewTasks}</span>
              <span className="text-xs text-muted font-medium">
                {summary.inProgressTasks} làm • {summary.inReviewTasks} duyệt
              </span>
            </div>
            <div className="mt-2.5 flex gap-1">
              <span className="text-[10px] text-muted">Chờ làm: {summary.todoTasks}</span>
            </div>
          </div>

          {/* KPI 4: Overdue & Urgent Alert */}
          <div
            className={`rounded-2xl border p-4 flex flex-col justify-between shadow-sm ${
              summary.overdueTasks > 0 ? "border-red-500/40 bg-red-950/20" : "border-line bg-surface"
            }`}
          >
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Cảnh báo trễ hạn</span>
              <AlertTriangle className={`h-4 w-4 ${summary.overdueTasks > 0 ? "text-red-400" : "text-muted"}`} />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className={`text-2xl font-black ${summary.overdueTasks > 0 ? "text-red-400" : "text-foreground"}`}>
                {summary.overdueTasks}
              </span>
              <span className="text-xs font-semibold text-red-400">
                {summary.urgentTasks} khẩn cấp
              </span>
            </div>
            <div className="mt-2.5">
              <span className="text-[10px] text-muted">
                {summary.overdueTasks > 0 ? "Cần xử lý ngay lập tức" : "Đúng tiến độ hạn chót"}
              </span>
            </div>
          </div>

          {/* KPI 5: Ticket KH */}
          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Hộp thư Ticket KH</span>
              <LifeBuoy className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-purple-400">{ticketStats.resolutionRate}%</span>
              <span className="text-xs text-muted font-medium">
                {ticketStats.resolved + ticketStats.closed}/{ticketStats.total} ticket
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-muted">
              <span>Mở: {ticketStats.open + ticketStats.triaged}</span>
              <span>Đang xử lý: {ticketStats.inProgress}</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2: ACTIVE SPRINT PROGRESS BANNER                                      */}
        {/* ========================================================================= */}
        {activeSprint && (
          <div className="rounded-2xl border border-accent/40 bg-gradient-to-r from-accent/15 via-surface to-surface p-4 shadow-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 shadow-lg shadow-accent/30">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-accent">Sprint đang chạy</span>
                    <span className="text-sm font-extrabold text-foreground">{activeSprint.name}</span>
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {activeSprint.goal || "Chu kỳ phát triển hiện tại của đội ngũ"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-t-0 border-line pt-2 md:pt-0">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted">Hạn Sprint</div>
                  <div className="text-xs font-bold text-foreground mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-accent" />
                    {activeSprint.daysRemaining !== null ? `Còn ${activeSprint.daysRemaining} ngày` : "Chưa set hạn"}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted">Nhiệm vụ</div>
                  <div className="text-xs font-bold text-emerald-400 mt-0.5">
                    {activeSprint.doneTasks}/{activeSprint.totalTasks} xong
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-muted">Story Points</div>
                  <div className="text-xs font-bold text-accent mt-0.5">
                    {activeSprint.donePoints}/{activeSprint.totalPoints} pts
                  </div>
                </div>

                <Link href={`/projects/${projectId}/sprints`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs font-semibold border-accent/40 text-accent hover:bg-accent/10">
                    Chi tiết Sprint →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ROW 3: RECHARTS VISUAL ANALYTICS                                          */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Status Distribution */}
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Phân bổ trạng thái Task</h2>
              </div>
              <span className="text-xs text-muted">{summary.totalTasks} tasks</span>
            </div>

            {summary.totalTasks > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262b36" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8b93a3" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#8b93a3" }} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Số task" radius={[6, 6, 0, 0]}>
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center text-xs text-muted border border-dashed border-line rounded-xl">
                Chưa có task nào trong dự án
              </div>
            )}
          </div>

          {/* Chart 2: Priority Distribution */}
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Mức độ ưu tiên</h2>
              </div>
              <span className="text-xs text-muted">{summary.urgentTasks} khẩn cấp</span>
            </div>

            {summary.totalTasks > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityDistribution} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262b36" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#8b93a3" }} allowDecimals={false} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 10, fill: "#8b93a3" }} width={75} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Số task" radius={[0, 6, 6, 0]}>
                      {priorityDistribution.map((entry) => (
                        <Cell key={entry.priority} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center text-xs text-muted border border-dashed border-line rounded-xl">
                Chưa có dữ liệu độ ưu tiên
              </div>
            )}
          </div>

          {/* Chart 3: Department Breakdown */}
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Phòng ban tham gia ({teamBreakdown.length})</h2>
              </div>
              <span className="text-xs text-muted">{project.members.length} nhân sự</span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {teamBreakdown.map((team) => (
                <div key={team.id} className="p-2.5 rounded-xl border border-line bg-surface-2/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="font-bold text-foreground">{team.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted">{team.memberCount} người</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted">
                    <span>Khối lượng task: {team.totalTasks}</span>
                    <span className="text-emerald-400 font-semibold">{team.doneTasks} hoàn thành</span>
                  </div>
                  <div className="h-1 w-full bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: team.color,
                        width: `${team.totalTasks > 0 ? (team.doneTasks / team.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {teamBreakdown.length === 0 && (
                <div className="flex h-48 items-center justify-center text-xs text-muted border border-dashed border-line rounded-xl">
                  Chưa gán phòng ban cho thành viên
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 4: ACTIONABLE URGENT/OVERDUE TASKS & RECENT ACTIVITY FEED            */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent & Overdue Action List */}
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Công việc cần xử lý gấp ({urgentAndOverdueTasks.length})
                </h2>
              </div>
              <Link href={`/projects/${projectId}/board`}>
                <span className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  Xem trên Board <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {urgentAndOverdueTasks.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    t.isOverdue ? "border-red-900/40 bg-red-950/20" : "border-line bg-surface-2"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-muted">#{t.number}</span>
                        <span className="text-xs font-semibold text-foreground truncate">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted mt-1">
                        {t.isOverdue && (
                          <span className="text-red-400 font-bold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Hạn: {t.dueDate?.slice(0, 10)} (Quá hạn)
                          </span>
                        )}
                        {t.assignee && (
                          <span className="flex items-center gap-1">
                            <Avatar className="h-3.5 w-3.5 text-[8px]">
                              <AvatarFallback color={t.assignee.avatarColor}>
                                {initials(t.assignee.name)}
                              </AvatarFallback>
                            </Avatar>
                            {t.assignee.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === "URGENT" ? "bg-red-500/20 text-red-400" : "bg-surface text-muted"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}

              {urgentAndOverdueTasks.length === 0 && (
                <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-line text-xs text-muted">
                  🎉 Tuyệt vời! Không có công việc nào bị quá hạn hoặc khẩn cấp.
                </div>
              )}
            </div>
          </div>

          {/* Realtime Recent Activity Feed */}
          <div className="rounded-2xl border border-line bg-surface p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">Hoạt động dự án gần đây</h2>
              </div>
              <span className="text-xs text-muted">Thời gian thực</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 divide-y divide-line/60">
              {recentActivities.map((act) => (
                <div key={act.id} className="pt-2.5 first:pt-0 flex items-start gap-3 text-xs">
                  <Avatar className="h-7 w-7 text-[10px] shrink-0 mt-0.5">
                    <AvatarFallback color={act.actor.avatarColor}>
                      {initials(act.actor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-foreground">
                      <strong className="font-semibold">{act.actor.name}</strong>{" "}
                      <span className="text-muted">{act.detail || act.action}</span>{" "}
                      <strong className="font-medium text-accent">#{act.task?.number} - {act.task?.title}</strong>
                    </div>
                    <div className="text-[10px] text-muted mt-0.5">
                      {new Date(act.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))}

              {recentActivities.length === 0 && (
                <div className="flex h-48 items-center justify-center text-xs text-muted border border-dashed border-line rounded-xl">
                  Chưa có hoạt động nào được ghi nhận
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROW 5: TEAM WORKLOAD & PRODUCTIVITY SUMMARY TABLE                         */}
        {/* ========================================================================= */}
        <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface-2/40">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accent" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Năng suất & Khối lượng công việc nhân sự ({memberWorkloads.length})
              </h2>
            </div>
            <Link href={`/projects/${projectId}/reports`}>
              <span className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                Báo cáo KPI chi tiết <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line bg-surface-2/60 text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3">Nhân sự</th>
                  <th className="px-4 py-3">Phòng ban</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-3 py-3 text-center">Tổng Task</th>
                  <th className="px-3 py-3 text-center">Hoàn thành</th>
                  <th className="px-3 py-3 text-center">Đang làm</th>
                  <th className="px-3 py-3 text-center">Quá hạn</th>
                  <th className="px-3 py-3 text-center">Points</th>
                  <th className="px-5 py-3 text-right">Tỉ lệ hoàn thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {memberWorkloads.map((m) => (
                  <tr key={m.userId} className="hover:bg-surface-2/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 text-xs shrink-0">
                          <AvatarFallback color={m.avatarColor}>
                            {initials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-foreground">{m.name}</div>
                          <div className="text-[10px] text-muted">{m.title || "Thành viên dự án"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {m.teamName ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${m.teamColor}20`,
                            color: m.teamColor || "#6366f1",
                          }}
                        >
                          {m.teamName}
                        </span>
                      ) : (
                        <span className="text-muted/60">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-mono text-muted border border-line">
                        {m.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold">{m.totalTasks}</td>
                    <td className="px-3 py-3 text-center text-emerald-400 font-bold">{m.doneTasks}</td>
                    <td className="px-3 py-3 text-center text-amber-400 font-bold">{m.inProgressTasks}</td>
                    <td className="px-3 py-3 text-center font-bold">
                      {m.overdueTasks > 0 ? (
                        <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
                          {m.overdueTasks}
                        </span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-accent font-bold">{m.storyPoints}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${m.completionRate}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-emerald-400 text-xs w-10 text-right">
                          {m.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
