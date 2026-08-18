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
import { TrendingDown, Gauge, Users, Flame } from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";

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
  summary: { total: number; done: number; inProgress: number; openPoints: number };
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#94a3b8",
};

const tooltipStyle = {
  backgroundColor: "#1b1f28",
  border: "1px solid #333a49",
  borderRadius: 8,
  fontSize: 12,
  color: "#e8eaed",
};

export default function ReportsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [data, setData] = useState<ReportData | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/reports`);
    if (res.ok) setData(await res.json());
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Đang tải báo cáo...
      </div>
    );
  }

  const completionRate =
    data.summary.total > 0 ? Math.round((data.summary.done / data.summary.total) * 100) : 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center border-b border-line px-4">
        <h1 className="text-sm font-semibold">Báo cáo & Thống kê</h1>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="text-xs text-muted">Tổng số task</div>
            <div className="mt-1 text-2xl font-bold">{data.summary.total}</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="text-xs text-muted">Hoàn thành</div>
            <div className="mt-1 text-2xl font-bold text-emerald-400">
              {data.summary.done}
              <span className="ml-2 text-sm font-medium text-muted">({completionRate}%)</span>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="text-xs text-muted">Đang làm</div>
            <div className="mt-1 text-2xl font-bold text-amber-400">{data.summary.inProgress}</div>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="text-xs text-muted">Points còn lại</div>
            <div className="mt-1 text-2xl font-bold text-accent">{data.summary.openPoints}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Burndown */}
          <div className="rounded-xl border border-line bg-surface p-4">
            <div className="mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-accent" />
              <h2 className="text-sm font-semibold">Burndown Chart</h2>
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
              <Gauge className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-semibold">Velocity qua các sprint</h2>
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
              <Users className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold">Workload theo thành viên</h2>
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
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-red-400">
                              <Flame className="h-3 w-3" />
                              {w.urgent}
                            </span>
                          )}
                        </span>
                        <span className="text-muted">
                          {w.taskCount} tasks • {w.points} pts
                          {overloaded && (
                            <span className="ml-1.5 text-amber-400">⚠ quá tải</span>
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
              <Flame className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-semibold">Task đang mở theo độ ưu tiên</h2>
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
    </div>
  );
}
