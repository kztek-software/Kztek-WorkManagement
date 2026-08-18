"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Trash2, Send, CheckSquare, Square, History, MessageSquare } from "lucide-react";
import { STATUSES, PRIORITIES, TASK_TYPES } from "@/lib/constants";
import type {
  TaskDto,
  MemberDto,
  LabelDto,
  SprintDto,
  CommentDto,
  ActivityDto,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TaskDialog({
  projectId,
  taskId,
  tasks,
  members,
  labels,
  sprints,
  onClose,
  onChanged,
}: {
  projectId: string;
  taskId: string;
  tasks: TaskDto[];
  members: MemberDto[];
  labels: LabelDto[];
  sprints: SprintDto[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const task = tasks.find((t) => t.id === taskId);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [activity, setActivity] = useState<ActivityDto[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [tab, setTab] = useState<"comments" | "activity">("comments");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${projectId}/tasks/${taskId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setComments(data.comments ?? []);
          setActivity(data.activity ?? []);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [projectId, taskId]);

  if (!task) return null;

  async function patchTask(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask() {
    if (!confirm("Xoá task này?")) return;
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
    onClose();
    onChanged();
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: commentBody }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
      setCommentBody("");
    }
  }

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSubtask }),
    });
    if (res.ok) {
      setNewSubtask("");
      onChanged();
    }
  }

  async function toggleSubtask(subtaskId: string, done: boolean) {
    await fetch(`/api/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !done }),
    });
    onChanged();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="font-mono">FB-{task.number}</span>
            <span>•</span>
            <span>Tạo {formatDistanceToNow(new Date(task.createdAt), { locale: vi, addSuffix: true })}</span>
            {saving && <span className="text-amber-400">Đang lưu...</span>}
          </div>
          <DialogTitle className="mt-1">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 grid grid-cols-[1fr_220px] gap-6">
          {/* Left: description, subtasks, comments */}
          <div className="min-w-0 space-y-5">
            <div className="space-y-1.5">
              <Label>Mô tả</Label>
              <Textarea
                defaultValue={task.description ?? ""}
                rows={5}
                placeholder="Thêm mô tả..."
                onBlur={(e) => {
                  if (e.target.value !== (task.description ?? "")) {
                    patchTask({ description: e.target.value });
                  }
                }}
              />
            </div>

            {/* Subtasks */}
            <div className="space-y-2">
              <Label>
                Subtasks ({task.subtasks.filter((s) => s.done).length}/{task.subtasks.length})
              </Label>
              <div className="space-y-1">
                {task.subtasks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSubtask(s.id, s.done)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-surface-2 cursor-pointer"
                  >
                    {s.done ? (
                      <CheckSquare className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0 text-muted" />
                    )}
                    <span className={s.done ? "text-muted line-through" : ""}>{s.title}</span>
                  </button>
                ))}
              </div>
              <form onSubmit={addSubtask} className="flex gap-2">
                <Input
                  placeholder="Thêm subtask..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button type="submit" size="sm" variant="secondary">
                  Thêm
                </Button>
              </form>
            </div>

            {/* Tabs: comments / activity */}
            <div>
              <div className="mb-3 flex gap-1 border-b border-line">
                <button
                  onClick={() => setTab("comments")}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium cursor-pointer ${
                    tab === "comments"
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" /> Bình luận ({comments.length})
                </button>
                <button
                  onClick={() => setTab("activity")}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium cursor-pointer ${
                    tab === "activity"
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted"
                  }`}
                >
                  <History className="h-3.5 w-3.5" /> Hoạt động
                </button>
              </div>

              {tab === "comments" ? (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback color={c.author.avatarColor} className="text-[9px]">
                          {initials(c.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 rounded-lg bg-surface-2 p-2.5">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-semibold">{c.author.name}</span>
                          <span className="text-[10px] text-muted">
                            {formatDistanceToNow(new Date(c.createdAt), { locale: vi, addSuffix: true })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm">{c.body}</p>
                      </div>
                    </div>
                  ))}
                  <form onSubmit={addComment} className="flex gap-2">
                    <Input
                      placeholder="Viết bình luận..."
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                    />
                    <Button type="submit" size="icon" variant="secondary">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 text-xs">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback color={a.actor.avatarColor} className="text-[8px]">
                          {initials(a.actor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{a.actor.name}</span>{" "}
                        <span className="text-muted">{a.detail}</span>
                        <span className="ml-1.5 text-[10px] text-muted">
                          {formatDistanceToNow(new Date(a.createdAt), { locale: vi, addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {activity.length === 0 && (
                    <p className="text-xs text-muted">Chưa có hoạt động nào</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: properties */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Trạng thái</Label>
              <Select value={task.status} onValueChange={(v) => patchTask({ status: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select
                value={task.assigneeId ?? "none"}
                onValueChange={(v) => patchTask({ assigneeId: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Chưa giao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chưa giao</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Độ ưu tiên</Label>
              <Select value={task.priority} onValueChange={(v) => patchTask({ priority: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Loại</Label>
              <Select value={task.type} onValueChange={(v) => patchTask({ type: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Story points</Label>
              <Input
                type="number"
                min={0}
                defaultValue={task.storyPoints ?? ""}
                className="h-8 text-xs"
                onBlur={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  if (val !== task.storyPoints) patchTask({ storyPoints: val });
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Hạn chót</Label>
              <Input
                type="date"
                defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                className="h-8 text-xs"
                onChange={(e) => {
                  patchTask({ dueDate: e.target.value || null });
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Sprint</Label>
              <Select
                value={task.sprintId ?? "none"}
                onValueChange={(v) => patchTask({ sprintId: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Không" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không</SelectItem>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Labels</Label>
              <div className="flex flex-wrap gap-1">
                {labels.map((l) => {
                  const selected = task.labels.some((tl) => tl.label.id === l.id);
                  return (
                    <button
                      key={l.id}
                      onClick={() => {
                        const next = selected
                          ? task.labels.filter((tl) => tl.label.id !== l.id).map((tl) => tl.label.id)
                          : [...task.labels.map((tl) => tl.label.id), l.id];
                        patchTask({ labelIds: next });
                      }}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium cursor-pointer"
                      style={{
                        backgroundColor: selected ? l.color : `${l.color}18`,
                        color: selected ? "#fff" : l.color,
                      }}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-line pt-3">
              <Button variant="danger" size="sm" className="w-full" onClick={deleteTask}>
                <Trash2 className="h-3.5 w-3.5" /> Xoá task
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
