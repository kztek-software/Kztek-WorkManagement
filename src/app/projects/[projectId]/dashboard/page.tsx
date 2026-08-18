"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
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
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Check,
  FolderKanban,
} from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PROJECT_STATUSES, projectStatusMeta } from "@/lib/constants";
import { canManageMembers } from "@/lib/permissions";
import { Tooltip } from "@/components/ui/tooltip";
import type { ProjectDashboardData } from "@/lib/types";

const tooltipStyle = {
  backgroundColor: "#181E2E",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: 10,
  fontSize: 11,
  color: "#F1F4F9",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
  padding: "6px 10px",
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
  const [leftTab, setLeftTab] = useState<"MEMBERS" | "TEAMS">("MEMBERS");

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
          prev ? { ...prev, project: { ...prev.project, status: newStatus } } : prev
        );
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-background gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent animate-pulse">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div className="text-xs font-semibold text-muted">Đang tải số liệu Dashboard dự án...</div>
      </div>
    );
  }

  if (!data || errorMsg) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-background p-6 gap-3">
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
                <KanbanSquare className="h-3.5 w-3.5 mr-1" /> Mở Board
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    project,
    summary,
    activeSprint,
    statusDistribution,
    priorityDistribution,
    memberWorkloads,
    teamBreakdown,
    urgentAndOverdueTasks,
    recentActivities,
    ticketStats,
    currentRole,
  } = data;
  const currentStatusMeta = projectStatusMeta(project.status);
  const hasManageRight = canManageMembers(currentRole);

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      {/* Top Header Controls Bar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4 bg-surface/50 backdrop-blur-md gap-3">
        {/* Left Project Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 border border-accent/30 text-accent font-bold text-xs shrink-0">
            <LayoutDashboard className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs font-bold text-foreground truncate">{project.name}</h1>
            <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.2 rounded border border-line">
              {project.key}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Status Dropdown Selector */}
          <div className="relative">
            {hasManageRight ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStatusMenuOpen((v) => !v)}
                  disabled={updatingStatus}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-sm cursor-pointer hover:opacity-90"
                  style={{
                    backgroundColor: currentStatusMeta.bg,
                    color: currentStatusMeta.color,
                    borderColor: currentStatusMeta.border,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: currentStatusMeta.color }} />
                  <span>{currentStatusMeta.label}</span>
                  <ChevronRight className="h-3 w-3 rotate-90 opacity-70" />
                </button>

                {statusMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 rounded-2xl border border-white/15 bg-[#131826] p-1.5 shadow-2xl backdrop-blur-2xl animate-fade-in-up">
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted border-b border-line/50 mb-1">
                      Cập nhật trạng thái
                    </div>
                    {PROJECT_STATUSES.map((st) => {
                      const isCurrent = project.status === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => handleStatusChange(st.id)}
                          className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            isCurrent ? "bg-surface-2 font-bold" : "hover:bg-surface-2/60 text-muted hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.color }} />
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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-sm"
                style={{
                  backgroundColor: currentStatusMeta.bg,
                  color: currentStatusMeta.color,
                  borderColor: currentStatusMeta.border,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: currentStatusMeta.color }} />
                <span>{currentStatusMeta.label}</span>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={loadDashboard}
            className="h-7.5 px-2 text-xs font-semibold border-line bg-surface hover:bg-surface-2"
          >
            <RefreshCw className="h-3 w-3 mr-1 text-muted" /> Tải lại
          </Button>

          <Link href={`/projects/${projectId}/board`}>
            <Button size="sm" className="h-7.5 px-2.5 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25">
              <KanbanSquare className="h-3.5 w-3.5 mr-1" /> Mở Board
            </Button>
          </Link>

          {hasManageRight && (
            <Link href={`/projects/${projectId}/all-projects`}>
              <Button
                size="sm"
                variant="outline"
                className="h-7.5 px-2 text-xs font-bold border-accent/40 text-accent hover:bg-accent/10 shadow-sm"
              >
                <FolderKanban className="h-3 w-3 mr-1 text-accent" /> Tất Cả Dự Án
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Single-View Dashboard Canvas */}
      <div className="flex-1 min-h-0 p-3 flex flex-col gap-2.5 overflow-hidden w-full max-w-[1920px] mx-auto">
        {/* ROW 1: 5 COMPACT KPI CARDS */}
        <div className="grid grid-cols-5 gap-2.5 shrink-0">
          {/* KPI 1 */}
          <div className="rounded-xl border border-line bg-surface p-2.5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="font-bold uppercase tracking-wider text-[9px]">Tiến độ công việc</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-emerald-400 leading-none">{summary.completionRate}%</span>
              <span className="text-[10px] text-muted font-medium">
                {summary.doneTasks}/{summary.totalTasks} tasks
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${summary.completionRate}%` }} />
            </div>
          </div>

          {/* KPI 2 */}
          <div className="rounded-xl border border-line bg-surface p-2.5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="font-bold uppercase tracking-wider text-[9px]">Story Points</span>
              <Briefcase className="h-3.5 w-3.5 text-accent" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-accent leading-none">{summary.doneStoryPoints}</span>
              <span className="text-[10px] text-muted font-medium">
                /{summary.totalStoryPoints} pts ({summary.pointsCompletionRate}%)
              </span>
            </div>
            <div className="mt-1.5 h-1 w-full bg-surface-2 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${summary.pointsCompletionRate}%` }} />
            </div>
          </div>

          {/* KPI 3 */}
          <div className="rounded-xl border border-line bg-surface p-2.5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="font-bold uppercase tracking-wider text-[9px]">Đang thực hiện</span>
              <Clock className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-amber-400 leading-none">{summary.inProgressTasks + summary.inReviewTasks}</span>
              <span className="text-[10px] text-muted font-medium">
                {summary.inProgressTasks} làm • {summary.inReviewTasks} duyệt
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-muted">
              <span>Chờ làm: {summary.todoTasks}</span>
              <span>Backlog: {summary.backlogTasks}</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div
            className={`rounded-xl border p-2.5 flex flex-col justify-between shadow-sm ${
              summary.overdueTasks > 0 ? "border-red-500/40 bg-red-950/20" : "border-line bg-surface"
            }`}
          >
            <div className="flex items-center justify-between text-muted">
              <span className="font-bold uppercase tracking-wider text-[9px]">Quá hạn & Khẩn cấp</span>
              <AlertTriangle className={`h-3.5 w-3.5 ${summary.overdueTasks > 0 ? "text-red-400" : "text-muted"}`} />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`text-xl font-black leading-none ${summary.overdueTasks > 0 ? "text-red-400" : "text-foreground"}`}>
                {summary.overdueTasks}
              </span>
              <span className="text-[10px] font-semibold text-red-400">
                {summary.urgentTasks} khẩn cấp
              </span>
            </div>
            <div className="mt-1.5 text-[9px] text-muted truncate">
              {summary.overdueTasks > 0 ? "⚠️ Cần ưu tiên xử lý" : "✓ Đúng tiến độ"}
            </div>
          </div>

          {/* KPI 5 */}
          <div className="rounded-xl border border-line bg-surface p-2.5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-muted">
              <span className="font-bold uppercase tracking-wider text-[9px]">Tickets Khách Hàng</span>
              <LifeBuoy className="h-3.5 w-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-purple-400 leading-none">{ticketStats.resolutionRate}%</span>
              <span className="text-[10px] text-muted font-medium">
                {ticketStats.resolved + ticketStats.closed}/{ticketStats.total} xong
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-muted">
              <span>Mở: {ticketStats.open + ticketStats.triaged}</span>
              <span>Đang sửa: {ticketStats.inProgress}</span>
            </div>
          </div>
        </div>

        {/* ROW 2: ACTIVE SPRINT COMPACT STRIP (IF RUNNING) */}
        {activeSprint && (
          <div className="shrink-0 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-1.5 flex items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-5 w-5 rounded-md bg-accent text-white flex items-center justify-center shrink-0">
                <Rocket className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent shrink-0">Sprint:</span>
              <span className="font-extrabold text-foreground truncate">{activeSprint.name}</span>
              {activeSprint.goal && (
                <span className="text-muted text-[11px] truncate hidden md:inline">• {activeSprint.goal}</span>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0 text-[11px]">
              <span className="flex items-center gap-1 text-muted">
                <Calendar className="h-3 w-3 text-accent" />
                {activeSprint.daysRemaining !== null ? `Còn ${activeSprint.daysRemaining} ngày` : "Chưa set hạn"}
              </span>
              <span className="text-emerald-400 font-bold">
                {activeSprint.doneTasks}/{activeSprint.totalTasks} task ({activeSprint.donePoints}/{activeSprint.totalPoints} pts)
              </span>
              <Link href={`/projects/${projectId}/sprints`}>
                <span className="text-accent hover:underline font-bold text-[11px] flex items-center gap-0.5">
                  Chi tiết <ChevronRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* ROW 3: SPLIT 2-COLUMN SINGLE-VIEW ANALYTICAL WORKSPACE */}
        <div className="flex-1 min-h-0 grid grid-cols-12 gap-2.5 overflow-hidden">
          {/* LEFT 7 COLS: CHARTS & TEAM/MEMBERS TABLE */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-2.5 min-h-0 h-full overflow-hidden">
            {/* Top Charts Card (Height 48%) */}
            <div className="h-[48%] min-h-0 rounded-xl border border-line bg-surface p-3 flex flex-col shadow-sm">
              <div className="flex items-center justify-between pb-1.5 border-b border-line/60 shrink-0">
                <div className="flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                    Phân bổ Trạng thái & Mức độ ưu tiên
                  </span>
                </div>
                <span className="text-[10px] text-muted font-mono">{summary.totalTasks} công việc</span>
              </div>

              <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 pt-2">
                {/* Status Chart */}
                <div className="h-full min-h-0 flex flex-col">
                  <span className="text-[10px] text-muted font-semibold mb-1">Theo Trạng thái</span>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusDistribution} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262b36" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#8b93a3" }} />
                        <YAxis tick={{ fontSize: 9, fill: "#8b93a3" }} allowDecimals={false} />
                        <RechartsTooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" name="Số task" radius={[4, 4, 0, 0]}>
                          {statusDistribution.map((entry) => (
                            <Cell key={entry.status} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Priority Chart */}
                <div className="h-full min-h-0 flex flex-col">
                  <span className="text-[10px] text-muted font-semibold mb-1">Theo Mức độ ưu tiên</span>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityDistribution} layout="vertical" margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262b36" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 9, fill: "#8b93a3" }} allowDecimals={false} />
                        <YAxis type="category" dataKey="label" tick={{ fontSize: 9, fill: "#8b93a3" }} width={65} />
                        <RechartsTooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="count" name="Số task" radius={[0, 4, 4, 0]}>
                          {priorityDistribution.map((entry) => (
                            <Cell key={entry.priority} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tabbed Panel: Members Workload / Teams Breakdown (Height 52%) */}
            <div className="h-[52%] min-h-0 rounded-xl border border-line bg-surface flex flex-col overflow-hidden shadow-sm">
              {/* Tabs Header */}
              <div className="flex items-center justify-between border-b border-line px-3 py-1.5 bg-surface-2/40 shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLeftTab("MEMBERS")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      leftTab === "MEMBERS"
                        ? "bg-accent text-white shadow-sm"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <Users className="h-3 w-3" />
                    <span>Năng suất Nhân sự ({memberWorkloads.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLeftTab("TEAMS")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      leftTab === "TEAMS"
                        ? "bg-accent text-white shadow-sm"
                        : "text-muted hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <Building2 className="h-3 w-3" />
                    <span>Phòng ban tham gia ({teamBreakdown.length})</span>
                  </button>
                </div>

                <Link href={`/projects/${projectId}/reports`}>
                  <span className="text-[10px] font-bold text-accent hover:underline flex items-center gap-0.5">
                    Báo cáo KPI <ArrowUpRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

              {/* Tab Content (Scrollable internally) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-2">
                {leftTab === "MEMBERS" ? (
                  <table className="w-full text-left text-xs">
                    <thead className="text-muted text-[10px] uppercase font-bold border-b border-line/60">
                      <tr>
                        <th className="pb-1.5 pl-2">Nhân sự</th>
                        <th className="pb-1.5 text-center">Phòng ban</th>
                        <th className="pb-1.5 text-center">Task</th>
                        <th className="pb-1.5 text-center">Xong</th>
                        <th className="pb-1.5 text-center">Đang làm</th>
                        <th className="pb-1.5 text-center">Quá hạn</th>
                        <th className="pb-1.5 text-right pr-2">Tiến độ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line/40 text-[11px]">
                      {memberWorkloads.map((m) => (
                        <tr key={m.userId} className="hover:bg-surface-2/50 transition-colors">
                          <td className="py-1.5 pl-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5 text-[9px] shrink-0">
                                <AvatarFallback color={m.avatarColor}>
                                  {initials(m.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-semibold text-foreground truncate max-w-[120px]">{m.name}</span>
                            </div>
                          </td>
                          <td className="py-1.5 text-center">
                            {m.teamName ? (
                              <span
                                className="px-1.5 py-0.2 rounded text-[9px] font-bold"
                                style={{ backgroundColor: `${m.teamColor}20`, color: m.teamColor || "#6366f1" }}
                              >
                                {m.teamName}
                              </span>
                            ) : (
                              <span className="text-muted/50">—</span>
                            )}
                          </td>
                          <td className="py-1.5 text-center font-mono font-bold">{m.totalTasks}</td>
                          <td className="py-1.5 text-center font-mono font-bold text-emerald-400">{m.doneTasks}</td>
                          <td className="py-1.5 text-center font-mono font-bold text-amber-400">{m.inProgressTasks}</td>
                          <td className="py-1.5 text-center font-mono font-bold">
                            {m.overdueTasks > 0 ? (
                              <span className="text-red-400 bg-red-500/20 px-1 rounded text-[9px]">{m.overdueTasks}</span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td className="py-1.5 text-right pr-2">
                            <div className="flex items-center justify-end gap-1.5">
                              <div className="w-12 h-1 bg-surface-2 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${m.completionRate}%` }} />
                              </div>
                              <span className="font-extrabold text-emerald-400 text-[10px] w-7 text-right">
                                {m.completionRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="space-y-2">
                    {teamBreakdown.map((team) => (
                      <div key={team.id} className="p-2 rounded-lg border border-line bg-surface-2/50 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: team.color }} />
                            <span>{team.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted">{team.memberCount} thành viên</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted">
                          <span>Khối lượng: {team.totalTasks} tasks</span>
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
                      <div className="p-4 text-center text-xs text-muted">Chưa có phòng ban nào được gán cho dự án</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: URGENT TASKS & REALTIME ACTIVITIES */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-2.5 min-h-0 h-full overflow-hidden">
            {/* Top: Urgent & Overdue Action List (Height 50%) */}
            <div className="h-[50%] min-h-0 rounded-xl border border-line bg-surface p-2.5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between pb-1.5 border-b border-line/60 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                  <span>Công việc cần xử lý gấp ({urgentAndOverdueTasks.length})</span>
                </div>
                <Link href={`/projects/${projectId}/board`}>
                  <span className="text-[10px] font-bold text-accent hover:underline flex items-center gap-0.5">
                    Mở Board <ArrowUpRight className="h-3 w-3" />
                  </span>
                </Link>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pt-1.5 space-y-1.5 pr-1">
                {urgentAndOverdueTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
                      t.isOverdue ? "border-red-900/40 bg-red-950/20" : "border-line bg-surface-2/60"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-muted">#{t.number}</span>
                        <span className="font-semibold text-foreground truncate">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                        {t.isOverdue && (
                          <span className="text-red-400 font-bold flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> Quá hạn ({t.dueDate?.slice(5, 10)})
                          </span>
                        )}
                        {t.assignee && (
                          <span className="flex items-center gap-1 truncate">
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

                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                        t.priority === "URGENT" ? "bg-red-500/20 text-red-400" : "bg-surface text-muted"
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}

                {urgentAndOverdueTasks.length === 0 && (
                  <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
                    🎉 Không có công việc nào bị quá hạn hoặc khẩn cấp!
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Realtime Activities (Height 50%) */}
            <div className="h-[50%] min-h-0 rounded-xl border border-line bg-surface p-2.5 flex flex-col shadow-sm">
              <div className="flex items-center justify-between pb-1.5 border-b border-line/60 shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Hoạt động gần đây</span>
                </div>
                <span className="text-[10px] text-muted font-mono">Thời gian thực</span>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pt-1.5 space-y-1.5 pr-1 divide-y divide-line/40">
                {recentActivities.map((act) => (
                  <div key={act.id} className="pt-1.5 first:pt-0 flex items-start gap-2 text-xs">
                    <Avatar className="h-5 w-5 text-[8px] shrink-0 mt-0.5">
                      <AvatarFallback color={act.actor.avatarColor}>
                        {initials(act.actor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 text-[11px]">
                      <div className="text-foreground leading-tight">
                        <strong className="font-semibold">{act.actor.name}</strong>{" "}
                        <span className="text-muted">{act.detail || act.action}</span>{" "}
                        {act.task && (
                          <span className="font-medium text-accent">#{act.task.number} - {act.task.title}</span>
                        )}
                      </div>
                      <div className="text-[9px] text-muted mt-0.5">
                        {new Date(act.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}

                {recentActivities.length === 0 && (
                  <div className="flex h-full items-center justify-center text-xs text-muted border border-dashed border-line rounded-lg">
                    Chưa có hoạt động nào được ghi nhận
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
