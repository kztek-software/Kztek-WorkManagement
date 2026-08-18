"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Trash2,
  Send,
  CheckSquare,
  Square,
  History,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertTriangle,
  Layers,
  Plus,
  Loader2,
  Check,
  LifeBuoy,
  ExternalLink,
} from "lucide-react";
import { STATUSES, PRIORITIES, TASK_TYPES } from "@/lib/constants";
import { TaskAttachmentGallery } from "./task-attachment-gallery";
import { MentionCommentInput, RenderCommentContent } from "./mention-comment-input";
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
import { TypeIcon } from "./type-icon";
import { PriorityIcon } from "./priority-icon";

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
  const [title, setTitle] = useState(task?.title ?? "");

  useEffect(() => {
    if (task) setTitle(task.title);
  }, [task]);

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

  const doneSubtasks = task.subtasks.filter((s) => s.done).length;

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
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn task này?")) return;
    await fetch(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
    onClose();
    onChanged();
  }

  async function handleAddComment(data: { body: string; mentionedUserIds: string[] }) {
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const resData = await res.json();
      setComments((prev) => [...prev, resData.comment]);
      onChanged();
    }
  }

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const res = await fetch(`/api/projects/${projectId}/tasks/${taskId}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSubtask.trim() }),
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

  async function handleDeleteAttachment(attachmentId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa tệp đính kèm này?")) return;
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
      if (res.ok) onChanged();
    } catch (err) {
      console.error("Lỗi xóa attachment:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border border-line bg-surface shadow-2xl rounded-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line bg-surface-2/70 px-6 py-3.5">
          <div className="flex items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold font-mono text-accent bg-accent/15 px-2 py-0.5 rounded-md border border-accent/30">
              <TypeIcon type={task.type} />
              <span>#{task.number}</span>
            </div>
            <span className="text-muted font-medium">
              Tạo {formatDistanceToNow(new Date(task.createdAt), { locale: vi, addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                <Loader2 className="h-3 w-3 animate-spin" /> Đang lưu...
              </span>
            )}
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-[1fr_260px] divide-x divide-line max-h-[80vh] overflow-hidden">
          {/* Left Column: Title, Description, Subtasks, Comments */}
          <div className="p-6 space-y-5 overflow-y-auto min-w-0">
            {/* Customer Ticket Origin Banner */}
            {(task.title.startsWith("[TK-") || task.description?.includes("🎫 Nguồn: Báo lỗi từ khách hàng")) && (
              <div className="p-3 rounded-xl border border-accent/40 bg-accent/10 flex items-center justify-between gap-2 text-xs text-accent">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-accent shrink-0" />
                  <span className="font-semibold text-foreground">
                    Công việc này được tạo từ <strong>Ticket Báo lỗi Khách hàng</strong>
                  </span>
                </div>
                <a
                  href={`/projects/${projectId}/tickets`}
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>Mở Hộp Thư Ticket</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Title Input */}
            <div className="space-y-1">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && title !== task.title) {
                    patchTask({ title: title.trim() });
                  }
                }}
                className="text-base font-bold bg-transparent border-transparent hover:border-line focus:border-accent px-2 py-1.5 h-auto text-foreground"
                placeholder="Tiêu đề công việc..."
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted">Mô tả chi tiết</Label>
              <Textarea
                defaultValue={task.description ?? ""}
                rows={4}
                placeholder="Thêm mô tả, tài liệu yêu cầu hoặc ghi chú kỹ thuật..."
                onBlur={(e) => {
                  if (e.target.value !== (task.description ?? "")) {
                    patchTask({ description: e.target.value });
                  }
                }}
                className="text-xs bg-surface-2/60 border-line leading-relaxed focus:border-accent"
              />
            </div>

            {/* Media Gallery, Attachments, Bug Videos & Files */}
            <TaskAttachmentGallery
              projectId={projectId}
              taskId={taskId}
              attachments={task.attachments || []}
              onAttachmentChanged={onChanged}
            />

            {/* Subtasks / Checklist */}
            <div className="space-y-2.5 rounded-xl border border-line bg-surface-2/30 p-3.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-accent" />
                  Danh sách việc con (Checklist)
                </Label>
                <span className="text-[11px] font-bold text-muted font-mono">
                  {doneSubtasks}/{task.subtasks.length}
                </span>
              </div>

              {/* Subtask items */}
              <div className="space-y-1">
                {task.subtasks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSubtask(s.id, s.done)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs hover:bg-surface-2 transition-colors cursor-pointer group"
                  >
                    {s.done ? (
                      <CheckSquare className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0 text-muted group-hover:text-foreground" />
                    )}
                    <span
                      className={`min-w-0 flex-1 truncate ${
                        s.done ? "text-muted line-through" : "text-foreground font-medium"
                      }`}
                    >
                      {s.title}
                    </span>
                  </button>
                ))}
              </div>

              <form onSubmit={addSubtask} className="flex gap-2 pt-1">
                <Input
                  placeholder="Thêm mục việc con mới..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  className="h-8 text-xs bg-surface"
                />
                <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Thêm
                </Button>
              </form>
            </div>

            {/* Comments & Activity Tabs */}
            <div className="space-y-3 pt-2 border-t border-line/60">
              <div className="flex gap-2 border-b border-line pb-1">
                <button
                  onClick={() => setTab("comments")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    tab === "comments"
                      ? "bg-surface-2 text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Bình luận ({comments.length})
                </button>
                <button
                  onClick={() => setTab("activity")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    tab === "activity"
                      ? "bg-surface-2 text-accent"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <History className="h-3.5 w-3.5" />
                  Lịch sử hoạt động
                </button>
              </div>

              {tab === "comments" ? (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <Avatar className="h-7 w-7 shrink-0 border border-white/10 mt-0.5">
                        <AvatarFallback color={c.author.avatarColor} className="text-[9px] font-bold">
                          {initials(c.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 rounded-xl bg-surface-2 p-3 border border-line">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{c.author.name}</span>
                          <span className="text-[10px] text-muted">
                            {formatDistanceToNow(new Date(c.createdAt), { locale: vi, addSuffix: true })}
                          </span>
                        </div>
                        <RenderCommentContent body={c.body} members={members} />
                      </div>
                    </div>
                  ))}

                  {/* Mention Autocomplete Input */}
                  <div className="pt-2">
                    <MentionCommentInput
                      members={members}
                      onSubmit={handleAddComment}
                      placeholder="Viết bình luận... Gõ '@' để gắn thẻ thành viên dự án"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {activity.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-surface-2/40">
                      <Avatar className="h-5 w-5 shrink-0">
                        <AvatarFallback color={a.actor.avatarColor} className="text-[8px] font-bold">
                          {initials(a.actor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-foreground">{a.actor.name}</span>{" "}
                        <span className="text-muted">{a.detail}</span>
                        <span className="ml-2 text-[10px] text-muted/70">
                          {formatDistanceToNow(new Date(a.createdAt), { locale: vi, addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {activity.length === 0 && (
                    <p className="text-xs text-muted py-2 text-center">Chưa có lịch sử hoạt động</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Properties & Meta */}
          <div className="p-5 space-y-4 bg-surface-2/30 overflow-y-auto">
            {/* Status */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Trạng thái</Label>
              <Select value={task.status} onValueChange={(v) => patchTask({ status: v })}>
                <SelectTrigger className="h-8 text-xs bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Người phụ trách</Label>
              <Select
                value={task.assigneeId ?? "none"}
                onValueChange={(v) => patchTask({ assigneeId: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-8 text-xs bg-surface">
                  <SelectValue placeholder="Chưa giao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs text-muted">Chưa giao</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user.id} value={m.user.id} className="text-xs">
                      {m.user.name} ({m.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Mức độ ưu tiên</Label>
              <Select value={task.priority} onValueChange={(v) => patchTask({ priority: v })}>
                <SelectTrigger className="h-8 text-xs bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Type */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Loại công việc</Label>
              <Select value={task.type} onValueChange={(v) => patchTask({ type: v })}>
                <SelectTrigger className="h-8 text-xs bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Story Points */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Story Points</Label>
              <Input
                type="number"
                min={0}
                defaultValue={task.storyPoints ?? ""}
                className="h-8 text-xs bg-surface font-mono"
                placeholder="Điểm ước lượng..."
                onBlur={(e) => {
                  const val = e.target.value === "" ? null : Number(e.target.value);
                  if (val !== task.storyPoints) patchTask({ storyPoints: val });
                }}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Hạn chót (Deadline)</Label>
              <Input
                type="date"
                defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                className="h-8 text-xs bg-surface"
                onChange={(e) => {
                  patchTask({ dueDate: e.target.value || null });
                }}
              />
            </div>

            {/* Sprint */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Kế hoạch Sprint</Label>
              <Select
                value={task.sprintId ?? "none"}
                onValueChange={(v) => patchTask({ sprintId: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-8 text-xs bg-surface">
                  <SelectValue placeholder="Không gắn sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs text-muted">Không gắn sprint</SelectItem>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Labels */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted">Nhãn phân loại</Label>
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
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      style={{
                        backgroundColor: selected ? l.color : `${l.color}15`,
                        color: selected ? "#fff" : l.color,
                        border: `1px solid ${l.color}40`,
                      }}
                    >
                      {selected && <Check className="h-2.5 w-2.5" />}
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delete Task Action */}
            <div className="border-t border-line/60 pt-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-red-400 border-red-500/30 hover:bg-red-950/30 hover:text-red-300"
                onClick={deleteTask}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Xóa công việc này
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
