"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import {
  TrendingDown,
  Gauge,
  Users,
  Flame,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTabCache } from "@/lib/tab-cache";

type AccountReport = {
  userId: string;
  name: string;
  email: string;
  avatarColor: string;
  title: string | null;
  role: string;
  summary: {
    totalAssigned: number;
    done: number;
    inProgress: number;
    inReview: number;
    todo: number;
    backlog: number;
    overdueCount: number;
    totalPoints: number;
    donePoints: number;
    remainingPoints: number;
    completionRate: number;
    pointsRate: number;
  };
  priorityBreakdown: {
    URGENT: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  statusBreakdown: {
    BACKLOG: number;
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };
  overdueTasks: {
    id: string;
    number: number;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    storyPoints: number | null;
  }[];
  recentTasks: {
    id: string;
    number: number;
    title: string;
    status: string;
    priority: string;
    dueDate: string | null;
    storyPoints: number | null;
    updatedAt: string;
  }[];
};

type ReportData = {
  burndown: { date: string; ideal: number; actual: number | null }[];
  burndownSprint: { id: string; name: string; totalPoints: number } | null;
  velocity: { name: string; committed: number; completed: number; status: string }[];
  workload: {
    userId: string;
    name: string;
    avatarColor: string;
    title: string | null;
    taskCount: number;
    points: number;
    urgent: number;
  }[];
  priorityDist: { priority: string; count: number }[];
  accountReports: AccountReport[];
  summary: {
    total: number;
    done: number;
    inProgress: number;
    inReview: number;
    todo: number;
    backlog: number;
    overdue: number;
    totalPoints: number;
    donePoints: number;
    openPoints: number;
  };
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#F05922",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#94a3b8",
};

const STATUS_COLORS: Record<string, string> = {
  DONE: "#10b981",
  IN_REVIEW: "#8b5cf6",
  IN_PROGRESS: "#3b82f6",
  TODO: "#f59e0b",
  BACKLOG: "#64748b",
};

const tooltipStyle = {
  backgroundColor: "#181E2E",
  border: "1px solid rgba(255, 255, 255, 0.14)",
  borderRadius: 10,
  fontSize: 12,
  color: "#F1F4F9",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
};

export default function ReportsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [activeTab, setActiveTab] = useState<"overview" | "accounts">("accounts");
  const [selectedUserId, setSelectedUserId] = useState<string>("ALL");

  const reportsApiUrl = projectId ? `/api/projects/${projectId}/reports` : null;

  const fetchReports = useCallback(async (): Promise<ReportData> => {
    if (!projectId) throw new Error("No project ID");
    const res = await fetch(`/api/projects/${projectId}/reports`);
    if (!res.ok) throw new Error("Failed to load reports");
    return await res.json();
  }, [projectId]);

  const {
    data,
    loading,
    revalidate: load,
  } = useTabCache<ReportData>(reportsApiUrl, fetchReports, {
    staleTime: 15000,
  });

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Đang tải báo cáo...
      </div>
    );
  }

  const completionRate =
    data.summary.total > 0 ? Math.round((data.summary.done / data.summary.total) * 100) : 0;

  const selectedMemberReport =
    selectedUserId === "ALL"
      ? null
      : data.accountReports?.find((r) => r.userId === selectedUserId) ?? null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row min-h-14 shrink-0 sm:items-center justify-between border-b border-line px-3 sm:px-4 py-2 sm:py-0 gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-sm font-bold">Báo cáo & Thống kê</h1>
          <div className="flex items-center rounded-lg bg-surface p-1 border border-line overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "accounts"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Báo cáo theo tài khoản
            </button>
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "overview"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <TrendingDown className="h-3.5 w-3.5" />
              Tổng quan & Sprint
            </button>
          </div>
        </div>

        {data.summary.overdue > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-accent-subtle border border-accent/30 px-3 py-1 text-xs font-semibold text-accent self-start sm:self-auto">
            <AlertTriangle className="h-3.5 w-3.5" />
            {data.summary.overdue} việc quá hạn
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3 sm:p-4">
        {/* ================= TAB 1: BÁO CÁO THEO TÀI KHOẢN ================= */}
        {activeTab === "accounts" && (
          <div className="space-y-4">
            {/* Member Selector Bar */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Chọn nhân sự:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedUserId("ALL")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      selectedUserId === "ALL"
                        ? "bg-accent text-white"
                        : "bg-surface-2 text-muted hover:text-foreground"
                    }`}
                  >
                    Tất cả thành viên ({data.accountReports.length})
                  </button>
                  {data.accountReports.map((member) => (
                    <button
                      key={member.userId}
                      onClick={() => setSelectedUserId(member.userId)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                        selectedUserId === member.userId
                          ? "bg-accent text-white shadow-sm"
                          : "bg-surface-2 text-muted hover:text-foreground"
                      }`}
                    >
                      <Avatar className="h-4 w-4 text-[9px]">
                        <AvatarFallback color={member.avatarColor}>
                          {initials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                      {member.summary.overdueCount > 0 && (
                        <span className="rounded-full bg-accent px-1 text-[9px] font-bold text-white">
                          {member.summary.overdueCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Individual Member Drilldown */}
            {selectedMemberReport && (
              <div className="space-y-4">
                {/* Personal KPI Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Tỉ lệ hoàn thành</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                        {selectedMemberReport.summary.completionRate}%
                      </span>
                      <span className="text-[11px] sm:text-xs text-muted truncate">
                        ({selectedMemberReport.summary.done}/{selectedMemberReport.summary.totalAssigned} việc)
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Points bàn giao</span>
                      <Briefcase className="h-4 w-4 text-accent" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-accent">
                        {selectedMemberReport.summary.donePoints}
                      </span>
                      <span className="text-[11px] sm:text-xs text-muted">
                        / {selectedMemberReport.summary.totalPoints} pts
                      </span>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl border p-3 sm:p-4 ${
                      selectedMemberReport.summary.overdueCount > 0
                        ? "border-accent/40 bg-accent-subtle"
                        : "border-line bg-surface"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Task quá hạn</span>
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          selectedMemberReport.summary.overdueCount > 0
                            ? "text-accent"
                            : "text-muted"
                        }`}
                      />
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span
                        className={`text-xl sm:text-2xl font-bold ${
                          selectedMemberReport.summary.overdueCount > 0
                            ? "text-accent"
                            : "text-foreground"
                        }`}
                      >
                        {selectedMemberReport.summary.overdueCount}
                      </span>
                      <span className="text-[11px] sm:text-xs text-muted">nhiệm vụ</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Đang thực hiện</span>
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl sm:text-2xl font-bold text-amber-600">
                        {selectedMemberReport.summary.inProgress +
                          selectedMemberReport.summary.inReview}
                      </span>
                      <span className="text-[11px] sm:text-xs text-muted">
                        ({selectedMemberReport.summary.remainingPoints} pts)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status & Priority Bars */}
                  <div className="rounded-xl border border-line bg-surface p-4 space-y-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-2">
                      <Layers className="h-4 w-4 text-accent" />
                      Phân bổ công việc của {selectedMemberReport.name}
                    </h2>

                    {/* Status Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted">Trạng thái công việc</span>
                        <span className="font-semibold text-foreground">
                          {selectedMemberReport.summary.totalAssigned} việc
                        </span>
                      </div>
                      <div className="flex h-3 overflow-hidden rounded-full bg-surface-2">
                        {selectedMemberReport.summary.done > 0 && (
                          <div
                            style={{
                              width: `${(selectedMemberReport.summary.done / selectedMemberReport.summary.totalAssigned) * 100}%`,
                              backgroundColor: STATUS_COLORS.DONE,
                            }}
                            title={`Hoàn thành: ${selectedMemberReport.summary.done}`}
                          />
                        )}
                        {selectedMemberReport.summary.inReview > 0 && (
                          <div
                            style={{
                              width: `${(selectedMemberReport.summary.inReview / selectedMemberReport.summary.totalAssigned) * 100}%`,
                              backgroundColor: STATUS_COLORS.IN_REVIEW,
                            }}
                            title={`Đang duyệt: ${selectedMemberReport.summary.inReview}`}
                          />
                        )}
                        {selectedMemberReport.summary.inProgress > 0 && (
                          <div
                            style={{
                              width: `${(selectedMemberReport.summary.inProgress / selectedMemberReport.summary.totalAssigned) * 100}%`,
                              backgroundColor: STATUS_COLORS.IN_PROGRESS,
                            }}
                            title={`Đang làm: ${selectedMemberReport.summary.inProgress}`}
                          />
                        )}
                        {selectedMemberReport.summary.todo > 0 && (
                          <div
                            style={{
                              width: `${(selectedMemberReport.summary.todo / selectedMemberReport.summary.totalAssigned) * 100}%`,
                              backgroundColor: STATUS_COLORS.TODO,
                            }}
                            title={`Cần làm: ${selectedMemberReport.summary.todo}`}
                          />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-[11px] pt-1">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          Hoàn thành: {selectedMemberReport.summary.done}
                        </span>
                        <span className="flex items-center gap-1 text-purple-600">
                          <span className="h-2 w-2 rounded-full bg-purple-500" />
                          Review: {selectedMemberReport.summary.inReview}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Đang làm: {selectedMemberReport.summary.inProgress}
                        </span>
                        <span className="flex items-center gap-1 text-amber-600">
                          <span className="h-2 w-2 rounded-full bg-amber-500" />
                          Chờ làm: {selectedMemberReport.summary.todo}
                        </span>
                      </div>
                    </div>

                    {/* Priority Breakdown */}
                    <div className="space-y-1.5 pt-2 border-t border-line">
                      <span className="text-xs text-muted">Mức độ ưu tiên</span>
                      <div className="grid grid-cols-4 gap-2 pt-1">
                        <div className="rounded-lg bg-accent-subtle border border-accent/30 p-2 text-center">
                          <div className="text-[11px] text-accent font-medium">Khẩn cấp</div>
                          <div className="text-lg font-bold text-accent">
                            {selectedMemberReport.priorityBreakdown.URGENT}
                          </div>
                        </div>
                        <div className="rounded-lg bg-orange-500/15 border border-orange-500/30 p-2 text-center">
                          <div className="text-[11px] text-orange-600 font-medium">Cao</div>
                          <div className="text-lg font-bold text-orange-600">
                            {selectedMemberReport.priorityBreakdown.HIGH}
                          </div>
                        </div>
                        <div className="rounded-lg bg-yellow-500/15 border border-yellow-500/30 p-2 text-center">
                          <div className="text-[11px] text-yellow-600 font-medium">Trung bình</div>
                          <div className="text-lg font-bold text-yellow-600">
                            {selectedMemberReport.priorityBreakdown.MEDIUM}
                          </div>
                        </div>
                        <div className="rounded-lg bg-slate-500/15 border border-slate-500/30 p-2 text-center">
                          <div className="text-[11px] text-slate-600 font-medium">Thấp</div>
                          <div className="text-lg font-bold text-slate-600">
                            {selectedMemberReport.priorityBreakdown.LOW}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Overdue Tasks & Recent Tasks */}
                  <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-accent" />
                        Danh sách cần xử lý gấp
                      </span>
                      {selectedMemberReport.overdueTasks.length > 0 && (
                        <span className="text-xs text-accent font-bold">
                          {selectedMemberReport.overdueTasks.length} việc quá hạn
                        </span>
                      )}
                    </h2>

                    {selectedMemberReport.overdueTasks.length > 0 ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto">
                        {selectedMemberReport.overdueTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between rounded-lg border border-accent/40 bg-accent-subtle p-2.5 text-xs"
                          >
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="font-medium text-foreground truncate">
                                #{t.number} - {t.title}
                              </div>
                              <div className="text-[11px] text-accent flex items-center gap-1.5 mt-0.5">
                                <Clock className="h-3 w-3" />
                                Hạn chót: {t.dueDate?.slice(0, 10)} (Đã quá hạn)
                              </div>
                            </div>
                            <span className="shrink-0 rounded bg-accent-subtle px-2 py-0.5 text-[10px] font-bold text-accent">
                              {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
                        🎉 Tuyệt vời! Không có công việc nào bị quá hạn.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Team Productivity Matrix (Table comparing all members) */}
            <div className="rounded-xl border border-line bg-surface overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-surface-2/30">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Ma trận So sánh Năng suất Nhân sự Toàn đội
                  </h2>
                </div>
                <span className="text-xs text-muted">{data.accountReports.length} thành viên</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-line bg-surface-2/50 text-muted uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Thành viên</th>
                      <th className="px-3 py-3">Vai trò</th>
                      <th className="px-3 py-3 text-right">Tổng việc</th>
                      <th className="px-3 py-3 text-right">Hoàn thành</th>
                      <th className="px-3 py-3 text-right">Đang làm</th>
                      <th className="px-3 py-3 text-right">Quá hạn</th>
                      <th className="px-3 py-3 text-right">Points (Xong/Tổng)</th>
                      <th className="px-4 py-3 text-right">Tỉ lệ hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {data.accountReports.map((m) => {
                      const isSelected = selectedUserId === m.userId;
                      return (
                        <tr
                          key={m.userId}
                          onClick={() => setSelectedUserId(m.userId)}
                          className={`hover:bg-surface-2/60 cursor-pointer transition-colors ${
                            isSelected ? "bg-accent/10" : ""
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-7 w-7 text-xs">
                                <AvatarFallback color={m.avatarColor}>
                                  {initials(m.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-foreground">{m.name}</div>
                                <div className="text-[11px] text-muted">{m.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted">
                              {m.role}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right font-semibold font-mono">
                            {m.summary.totalAssigned}
                          </td>
                          <td className="px-3 py-3 text-right text-emerald-600 font-semibold font-mono">
                            {m.summary.done}
                          </td>
                          <td className="px-3 py-3 text-right text-amber-600 font-semibold font-mono">
                            {m.summary.inProgress + m.summary.inReview}
                          </td>
                          <td className="px-3 py-3 text-right font-mono">
                            {m.summary.overdueCount > 0 ? (
                              <span className="rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-bold text-accent">
                                {m.summary.overdueCount}
                              </span>
                            ) : (
                              <span className="text-muted">0</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right text-accent font-semibold font-mono">
                            {m.summary.donePoints} / {m.summary.totalPoints}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 rounded-full bg-surface-2 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${m.summary.completionRate}%` }}
                                />
                              </div>
                              <span className="font-bold text-emerald-600 text-xs w-10 text-right font-mono">
                                {m.summary.completionRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: TỔNG QUAN & SPRINT ================= */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
                <div className="text-xs text-muted">Tổng số công việc</div>
                <div className="mt-1 text-xl sm:text-2xl font-bold">{data.summary.total}</div>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
                <div className="text-xs text-muted">Hoàn thành</div>
                <div className="mt-1 text-xl sm:text-2xl font-bold text-emerald-600">
                  {data.summary.done}
                  <span className="ml-1.5 text-xs sm:text-sm font-medium text-muted">({completionRate}%)</span>
                </div>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
                <div className="text-xs text-muted">Đang làm</div>
                <div className="mt-1 text-xl sm:text-2xl font-bold text-amber-600">{data.summary.inProgress}</div>
              </div>
              <div className="rounded-xl border border-line bg-surface p-3 sm:p-4">
                <div className="text-xs text-muted">Points còn lại</div>
                <div className="mt-1 text-xl sm:text-2xl font-bold text-accent">{data.summary.openPoints}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Burndown */}
              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold">Biểu đồ Burndown</h2>
                  {data.burndownSprint && (
                    <span className="text-xs text-muted">— {data.burndownSprint.name}</span>
                  )}
                </div>
                {data.burndown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={data.burndown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262b36" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#8b93a3" }}
                        tickFormatter={(d: string) => d.slice(5)}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#8b93a3" }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone"
                        dataKey="ideal"
                        name="Lý tưởng"
                        stroke="#64748b"
                        strokeDasharray="6 4"
                        dot={false}
                        strokeWidth={1.5}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        name="Thực tế"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#6366f1" }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-60 items-center justify-center text-xs text-muted">
                    Chưa có sprint nào có ngày bắt đầu/kết thúc
                  </div>
                )}
              </div>

              {/* Velocity */}
              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-semibold">Tốc độ (Velocity) qua các sprint</h2>
                </div>
                {data.velocity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.velocity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262b36" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#8b93a3" }}
                        tickFormatter={(n: string) => n.replace("Sprint ", "S")}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#8b93a3" }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="committed" name="Cam kết" fill="#333a49" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Hoàn thành" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-60 items-center justify-center text-xs text-muted">
                    Chưa có dữ liệu sprint
                  </div>
                )}
              </div>

              {/* Workload */}
              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-600" />
                  <h2 className="text-sm font-semibold">Khối lượng việc theo thành viên</h2>
                </div>
                <div className="space-y-3">
                  {data.workload.map((w) => {
                    const maxPoints = Math.max(...data.workload.map((x) => x.points), 1);
                    const overloaded = w.points > maxPoints * 0.6 && w.taskCount > 4;
                    return (
                      <div key={w.userId} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback color={w.avatarColor}>{initials(w.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium">
                              {w.name}
                              {w.urgent > 0 && (
                                <span className="ml-1.5 inline-flex items-center gap-0.5 text-accent">
                                  <Flame className="h-3 w-3" />
                                  {w.urgent}
                                </span>
                              )}
                            </span>
                            <span className="text-muted">
                              {w.taskCount} việc • {w.points} pts
                              {overloaded && (
                                <span className="ml-1.5 text-amber-600">⚠ quá tải</span>
                              )}
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className={`h-full rounded-full transition-all ${
                                overloaded ? "bg-amber-500" : "bg-accent"
                              }`}
                              style={{ width: `${(w.points / maxPoints) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {data.workload.length === 0 && (
                    <p className="text-xs text-muted">Chưa có thành viên</p>
                  )}
                </div>
              </div>

              {/* Priority distribution */}
              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-accent" />
                  <h2 className="text-sm font-semibold">Công việc theo độ ưu tiên</h2>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.priorityDist} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#262b36" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#8b93a3" }} allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="priority"
                      tick={{ fontSize: 10, fill: "#8b93a3" }}
                      width={70}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" name="Số task" radius={[0, 4, 4, 0]}>
                      {data.priorityDist.map((entry) => (
                        <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
