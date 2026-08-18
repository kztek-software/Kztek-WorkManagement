"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Rocket, Plus, Play, CheckCircle2, Clock } from "lucide-react";
import type { SprintDto, TaskDto } from "@/lib/types";
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

export default function SprintsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [sprints, setSprints] = useState<SprintDto[]>([]);
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/projects/${projectId}/tasks`);
    if (res.ok) {
      const data = await res.json();
      setSprints(data.sprints);
      setTasks(data.tasks);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createSprint(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/projects/${projectId}/sprints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        goal: goal || undefined,
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
    load();
  }

  async function updateSprintStatus(sprintId: string, status: string) {
    await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  function sprintStats(sprintId: string) {
    const sprintTasks = tasks.filter((t) => t.sprintId === sprintId);
    const total = sprintTasks.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    const done = sprintTasks
      .filter((t) => t.status === "DONE")
      .reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    return { count: sprintTasks.length, total, done };
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
        <h1 className="text-sm font-semibold">Sprints</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Sprint mới
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {sprints.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Rocket className="h-10 w-10 text-muted" />
            <p className="text-sm text-muted">Chưa có sprint nào. Tạo sprint đầu tiên!</p>
          </div>
        )}

        {[...sprints].reverse().map((sprint) => {
          const stats = sprintStats(sprint.id);
          const progress = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
          return (
            <div key={sprint.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold">{sprint.name}</h3>
                    {sprint.status === "ACTIVE" && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
                        Đang chạy
                      </span>
                    )}
                    {sprint.status === "COMPLETED" && (
                      <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted">
                        <CheckCircle2 className="h-3 w-3" /> Hoàn thành
                      </span>
                    )}
                    {sprint.status === "PLANNING" && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                        <Clock className="h-3 w-3" /> Lên kế hoạch
                      </span>
                    )}
                  </div>
                  {sprint.goal && <p className="mt-1 text-xs text-muted">{sprint.goal}</p>}
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
                    {sprint.startDate && (
                      <span>{format(new Date(sprint.startDate), "dd/MM/yyyy")}</span>
                    )}
                    {sprint.startDate && sprint.endDate && <span>→</span>}
                    {sprint.endDate && <span>{format(new Date(sprint.endDate), "dd/MM/yyyy")}</span>}
                    <span>•</span>
                    <span>{stats.count} tasks</span>
                    <span>•</span>
                    <span>
                      {stats.done}/{stats.total} points
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {sprint.status === "PLANNING" && (
                    <Button size="sm" variant="secondary" onClick={() => updateSprintStatus(sprint.id, "ACTIVE")}>
                      <Play className="h-3 w-3" /> Bắt đầu
                    </Button>
                  )}
                  {sprint.status === "ACTIVE" && (
                    <Button size="sm" onClick={() => updateSprintStatus(sprint.id, "COMPLETED")}>
                      <CheckCircle2 className="h-3 w-3" /> Hoàn thành
                    </Button>
                  )}
                </div>
              </div>

              {stats.total > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-1 text-right text-[10px] text-muted">{progress}%</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo sprint mới</DialogTitle>
            <DialogDescription>Sprint thường kéo dài 1-2 tuần</DialogDescription>
          </DialogHeader>
          <form onSubmit={createSprint} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Tên sprint</Label>
              <Input
                placeholder="VD: Sprint 3 — Hoàn thiện"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mục tiêu (tuỳ chọn)</Label>
              <Textarea
                placeholder="Mục tiêu của sprint này là gì?"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ngày bắt đầu</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Ngày kết thúc</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
                Huỷ
              </Button>
              <Button type="submit">Tạo sprint</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
