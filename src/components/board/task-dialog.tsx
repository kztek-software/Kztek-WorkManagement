"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Trash2,
  CheckSquare,
  Square,
  History,
  MessageSquare,
  AlertTriangle,
  Layers,
  Plus,
  Loader2,
  Check,
  LifeBuoy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  UserPlus,
  ChevronRight,
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { TypeIcon } from "./type-icon";

// Compact pill look shared by the quick-property bar triggers — same Select,
// just restyled so switching Status/Priority/Assignee/Type doesn't need a full-width row.
const PILL_TRIGGER =
  "h-7 w-auto gap-1.5 rounded-full border-none pl-2.5 pr-2 py-0 text-[11.5px] font-bold shadow-sm [&>span]:line-clamp-1";

export function TaskDialog({
  projectId,
  projectName,
  taskId,
  tasks,
  members,
  labels,
  sprints,
  onClose,
  onChanged,
}: {
  projectId: string;
  projectName?: string;
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
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

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

  // For "Giao việc này cho tôi" — only needs id/name, so a lightweight self-fetch is fine.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data.user) setCurrentUser({ id: data.user.id, name: data.user.name });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!task) return null;

  const doneSubtasks = task.subtasks.filter((s) => s.done).length;
  const subtaskProgress = task.subtasks.length > 0 ? (doneSubtasks / task.subtasks.length) * 100 : 0;
  const statusInfo = STATUSES.find((s) => s.id === task.status);
  const isOverdue = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();

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

  function copyLink() {
    const url = new URL(window.location.href);
    url.searchParams.set("taskId", taskId);
    navigator.clipboard.writeText(url.toString()).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 1800);
    });
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
      <DialogContent className="w-[96vw] max-w-5xl p-0 overflow-hidden border border-line bg-surface shadow-2xl rounded-2xl">
        {/* ============ Header ============ */}
        <div className="border-b border-line bg-surface-2/70">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 text-[11px] font-semibold text-muted">
            {projectName && (
              <>
                <span className="truncate max-w-[120px]">{projectName}</span>
                <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />
              </>
            )}
            <span className="text-foreground">{statusInfo?.label ?? task.status}</span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between gap-3 pl-4 sm:pl-6 pr-16 sm:pr-20 py-2.5">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="shrink-0 flex items-center gap-1.5 font-bold font-mono text-accent bg-accent/15 px-2 py-1 rounded-md border border-accent/30 text-xs">
                <TypeIcon type={task.type} />#{task.number}
              </span>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title.trim() && title !== task.title) {
                    patchTask({ title: title.trim() });
                  }
                }}
                className="min-w-0 flex-1 text-sm sm:text-base font-bold bg-transparent border-transparent hover:border-line focus:border-accent px-2 py-1 h-auto text-foreground"
                placeholder="Tiêu đề công việc..."
              />
            </div>

            <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
              {saving && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-amber-400 mr-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> Đang lưu...
                </span>
              )}
              <button
                onClick={copyLink}
                title="Sao chép liên kết task"
                className="h-8 w-8 rounded-lg border border-line bg-surface flex items-center justify-center text-muted hover:text-foreground hover:border-line-strong transition-colors cursor-pointer"
              >
                {linkCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Link2 className="h-3.5 w-3.5" />}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    title="Thêm thao tác"
                    className="h-8 w-8 rounded-lg border border-line bg-surface flex items-center justify-center text-muted hover:text-foreground hover:border-line-strong transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={copyLink}>
                    <Link2 className="h-3.5 w-3.5" /> Sao chép liên kết
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onClick={deleteTask}>
                    <Trash2 className="h-3.5 w-3.5" /> Xóa công việc
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quick property bar — the 4 fields changed most often, one tap away */}
          <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 pb-3">
            <Select value={task.status} onValueChange={(v) => patchTask({ status: v })}>
              <SelectTrigger
                className={PILL_TRIGGER}
                style={{ backgroundColor: statusInfo?.color, color: "#fff" }}
              >
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

            <Select value={task.priority} onValueChange={(v) => patchTask({ priority: v })}>
              <SelectTrigger
                className={`${PILL_TRIGGER} bg-surface border border-line text-foreground`}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: PRIORITIES.find((p) => p.id === task.priority)?.color }}
                />
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

            <Select
              value={task.assigneeId ?? "none"}
              onValueChange={(v) => patchTask({ assigneeId: v === "none" ? null : v })}
            >
              <SelectTrigger className={`${PILL_TRIGGER} bg-surface border border-line text-foreground`}>
                {task.assignee ? (
                  <Avatar className="h-4 w-4 -ml-0.5">
                    <AvatarFallback color={task.assignee.avatarColor} className="text-[7px] font-bold">
                      {initials(task.assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
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

            <Select value={task.type} onValueChange={(v) => patchTask({ type: v })}>
              <SelectTrigger className={`${PILL_TRIGGER} bg-surface border border-line text-foreground`}>
                <TypeIcon type={task.type} />
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

            {task.title.startsWith("[TK-") && (
              <span className="text-[10px] font-mono font-bold text-accent bg-accent/15 border border-accent/30 rounded-full px-2.5 py-1">
                Ticket KH
              </span>
            )}
          </div>
        </div>

        {/* ============ Body: Responsive 2 Columns ============ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] divide-y lg:divide-y-0 lg:divide-x divide-line max-h-[85vh] lg:max-h-[78vh] overflow-y-auto lg:overflow-hidden">
          {/* Left Column: Description, Subtasks, Comments */}
          <div className="flex flex-col min-w-0 lg:max-h-full lg:overflow-hidden">
            <div className="flex-1 min-h-0 p-3.5 sm:p-6 space-y-4 sm:space-y-5 lg:overflow-y-auto">
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

                {task.subtasks.length > 0 && (
                  <div className="h-1 w-full rounded-full bg-surface-2 overflow-hidden border border-line">
                    <div
                      className={`h-full transition-all duration-300 ${subtaskProgress === 100 ? "bg-emerald-500" : "bg-accent"}`}
                      style={{ width: `${subtaskProgress}%` }}
                    />
                  </div>
                )}

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
                    {comments.length === 0 && (
                      <p className="text-xs text-muted py-2 text-center">Chưa có bình luận nào</p>
                    )}
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

            {/* Composer pinned to the bottom on desktop — stays reachable on long threads */}
            {tab === "comments" && (
              <div className="shrink-0 px-3.5 sm:px-6 py-3 border-t border-line bg-surface/95 backdrop-blur-sm">
                <MentionCommentInput
                  members={members}
                  onSubmit={handleAddComment}
                  placeholder="Viết bình luận... Gõ '@' để gắn thẻ thành viên dự án"
                />
              </div>
            )}
          </div>

          {/* Right Column: secondary properties, grouped */}
          <div className="p-3.5 sm:p-5 space-y-4 bg-surface-2/30 overflow-y-auto">
            {!task.assigneeId && currentUser && (
              <button
                onClick={() => patchTask({ assigneeId: currentUser.id })}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-dashed border-line-strong bg-accent-subtle text-accent text-xs font-bold hover:bg-accent/20 transition-colors cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" /> Giao việc này cho tôi
              </button>
            )}

            <div className="rounded-xl border border-line bg-surface p-3.5 space-y-3">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Phân loại</div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <Label className="text-[10.5px] font-semibold text-muted">Điểm ước lượng</Label>
                  <Input
                    type="number"
                    min={0}
                    defaultValue={task.storyPoints ?? ""}
                    className="h-8 text-xs bg-surface-2 font-mono"
                    placeholder="—"
                    onBlur={(e) => {
                      const val = e.target.value === "" ? null : Number(e.target.value);
                      if (val !== task.storyPoints) patchTask({ storyPoints: val });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10.5px] font-semibold text-muted">Hạn chót</Label>
                  <Input
                    type="date"
                    defaultValue={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                    className={`h-8 text-xs bg-surface-2 ${isOverdue ? "text-accent font-bold border-accent/40" : ""}`}
                    onChange={(e) => {
                      patchTask({ dueDate: e.target.value || null });
                    }}
                  />
                </div>
              </div>
              {isOverdue && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-accent">
                  <AlertTriangle className="h-3 w-3" /> Đã quá hạn xử lý
                </span>
              )}
            </div>

            <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> Kế hoạch Sprint
              </div>
              <Select
                value={task.sprintId ?? "none"}
                onValueChange={(v) => patchTask({ sprintId: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-8 text-xs bg-surface-2">
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

            <div className="rounded-xl border border-line bg-surface p-3.5 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Nhãn phân loại</div>
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
                {labels.length === 0 && (
                  <span className="text-[11px] text-muted">Dự án chưa có nhãn nào</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
