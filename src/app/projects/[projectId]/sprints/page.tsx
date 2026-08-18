"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import {
  Rocket,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  Flame,
  ArrowRight,
} from "lucide-react";
import type { SprintDto, TaskDto, MemberDto, LabelDto } from "@/lib/types";
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
import { SprintDetailDialog } from "@/components/sprint/sprint-detail-dialog";
import { TaskDialog } from "@/components/board/task-dialog";

export default function SprintsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [sprints, setSprints] = useState<SprintDto[]>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [labels, setLabels] = useState<LabelDto[]>([]);
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectKey, setProjectKey] = useState("TASK");
  const [loading, setLoading] = useState(true);

  // Selected Sprint for Detail Inspector
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);

  // Task Dialog for direct inspection
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  // Create Sprint Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setSprints(data.sprints || []);
        setTasks(data.tasks || []);
        setLabels(data.labels || []);
        setMembers(data.members || []);
        setProjectName(data.project?.name || "Dự án");
        setProjectKey(data.project?.key || "TASK");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createSprint(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/sprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          goal: goal.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tạo được sprint");
        return;
      }
      setCreateOpen(false);
      setName("");
      setGoal("");
      setStartDate("");
      setEndDate("");
      await load();
      if (data.sprint?.id) {
        setSelectedSprintId(data.sprint.id);
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateSprintStatus(sprintId: string, status: string, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      load();
    } catch {
      alert("Lỗi cập nhật sprint");
    }
  }

  function sprintStats(sprintId: string) {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprintId);
    const total = sprintTasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    const done = sprintTasks
      .filter((t) => t.status === "DONE")
      .reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    const doneCount = sprintTasks.filter((t) => t.status === "DONE").length;
    return { count: sprintTasks.length, doneCount, total, done };
  }

  const selectedSprint = sprints.find((s) => s.id === selectedSprintId);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-xs font-semibold text-muted flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
          Đang tải danh sách Sprint...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5 bg-surface/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <span>Dự án</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted/60" />
            <span className="text-foreground font-bold">{projectName}</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted/60" />
            <span className="text-accent font-bold">Kế hoạch Sprint</span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="h-8 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Sprint mới
        </Button>
      </div>

      {/* Main Sprints List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5 max-w-5xl mx-auto w-full">
        {sprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center rounded-2xl border border-dashed border-line bg-surface/30">
            <div className="h-12 w-12 rounded-2xl bg-surface-2 flex items-center justify-center text-muted">
              <Rocket className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Chưa có sprint nào trong dự án</p>
              <p className="text-xs text-muted mt-0.5">Tạo sprint mới để phân bổ công việc theo chu kỳ 1-2 tuần</p>
            </div>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="mt-2 text-xs font-bold">
              <Plus className="h-3.5 w-3.5 mr-1" /> Tạo sprint đầu tiên
            </Button>
          </div>
        ) : (
          [...sprints].reverse().map((sprint) => {
            const stats = sprintStats(sprint.id);
            const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
            const taskProgress = stats.count > 0 ? Math.round((stats.doneCount / stats.count) * 100) : 0;

            return (
              <div
                key={sprint.id}
                onClick={() => setSelectedSprintId(sprint.id)}
                className="group relative rounded-2xl border border-line bg-surface p-5 shadow-sm hover:border-accent/60 hover:shadow-lg hover:bg-surface-2/40 transition-all space-y-4 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-1.5">
                        <span>{sprint.name}</span>
                      </h3>

                      {sprint.status === "ACTIVE" && (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          Đang hoạt động
                        </span>
                      )}

                      {sprint.status === "COMPLETED" && (
                        <span className="flex items-center gap-1 rounded-full bg-surface-2 border border-line px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Đã hoàn thành
                        </span>
                      )}

                      {sprint.status === "PLANNING" && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                          <Clock className="h-3.5 w-3.5" /> Lên kế hoạch
                        </span>
                      )}
                    </div>

                    {sprint.goal && (
                      <p className="text-xs text-muted-light leading-relaxed bg-surface-2/60 p-2.5 rounded-xl border border-line/60">
                        🎯 <strong>Mục tiêu:</strong> {sprint.goal}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted pt-1 flex-wrap">
                      {(sprint.startDate || sprint.endDate) && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted/80" />
                          {sprint.startDate ? format(new Date(sprint.startDate), "dd/MM/yyyy") : "—"}
                          <span>→</span>
                          {sprint.endDate ? format(new Date(sprint.endDate), "dd/MM/yyyy") : "—"}
                        </span>
                      )}
                      <span>•</span>
                      <span className="font-semibold text-foreground">
                        {stats.count} công việc ({stats.doneCount} hoàn thành)
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-accent font-mono">
                        {stats.done}/{stats.total} points ({progress}%)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* View Details Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSprintId(sprint.id)}
                      className="h-8 text-xs font-bold border-line bg-surface hover:bg-surface-2 text-foreground group-hover:border-accent group-hover:text-accent"
                    >
                      <Layers className="h-3.5 w-3.5 mr-1" />
                      Chi tiết Sprint
                      <ArrowRight className="h-3 w-3 ml-1 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </Button>

                    {sprint.status === "PLANNING" && (
                      <Button
                        size="sm"
                        onClick={(e) => updateSprintStatus(sprint.id, "ACTIVE", e)}
                        className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/40"
                      >
                        <Play className="h-3.5 w-3.5 mr-1" /> Kích hoạt Sprint
                      </Button>
                    )}

                    {sprint.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        onClick={(e) => updateSprintStatus(sprint.id, "COMPLETED", e)}
                        className="h-8 text-xs font-semibold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Đóng Sprint
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-muted">
                    <span>Tiến độ hoàn thành Story Points</span>
                    <span className="font-bold text-foreground">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2 border border-line">
                    <div
                      className={`h-full transition-all duration-500 ${
                        progress === 100
                          ? "bg-emerald-500"
                          : progress > 50
                          ? "bg-accent"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SPRINT DETAIL DIALOG */}
      {selectedSprint && (
        <SprintDetailDialog
          projectId={projectId}
          projectName={projectName}
          projectKey={projectKey}
          sprint={selectedSprint}
          tasks={tasks}
          members={members}
          labels={labels}
          sprints={sprints}
          open={!!selectedSprintId}
          onOpenChange={(open) => !open && setSelectedSprintId(null)}
          onChanged={load}
          onSelectTask={(taskId) => setOpenTaskId(taskId)}
        />
      )}

      {/* TASK DETAIL DIALOG */}
      {openTaskId && (
        <TaskDialog
          projectId={projectId}
          taskId={openTaskId}
          tasks={tasks}
          members={members}
          labels={labels}
          sprints={sprints}
          onClose={() => setOpenTaskId(null)}
          onChanged={load}
        />
      )}

      {/* CREATE SPRINT MODAL */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Rocket className="h-4 w-4 text-accent" />
              Tạo Sprint Kế Hoạch Mới
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sprint là chu kỳ phát triển 1-2 tuần để hoàn thành tập trung các mục tiêu
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createSprint} className="mt-2 space-y-3.5">
            {error && (
              <div className="rounded-lg bg-red-500/10 p-2.5 text-xs text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs">Tên Sprint *</Label>
              <Input
                placeholder="VD: Sprint 1 — Hoàn thiện tính năng Quản lý xe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Mục tiêu Sprint (Goal)</Label>
              <Textarea
                placeholder="Mục tiêu cốt lõi cần đạt được trong đợt chạy này..."
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-line">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={submitting} className="font-bold">
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                Tạo Sprint
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
