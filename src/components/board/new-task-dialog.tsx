"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { STATUSES, PRIORITIES, TASK_TYPES } from "@/lib/constants";
import type { LabelDto, MemberDto, SprintDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewTaskDialog({
  projectId,
  open,
  defaultStatus,
  members,
  labels,
  sprints,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  open: boolean;
  defaultStatus: string;
  members: MemberDto[];
  labels: LabelDto[];
  sprints: SprintDto[];
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("TASK");
  const [status, setStatus] = useState(defaultStatus);
  const [priority, setPriority] = useState("MEDIUM");
  const [storyPoints, setStoryPoints] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [sprintId, setSprintId] = useState("");
  const [labelIds, setLabelIds] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string | null>(null);

  // Reset khi mở dialog
  const [prevOpen, setPrevOpen] = useState(false);
  if (open && !prevOpen) {
    setPrevOpen(true);
    setStatus(defaultStatus);
  }
  if (!open && prevOpen) {
    setPrevOpen(false);
    setTitle("");
    setDescription("");
    setType("TASK");
    setPriority("MEDIUM");
    setStoryPoints("");
    setAssigneeId("");
    setSprintId("");
    setLabelIds([]);
    setSubtasks([]);
    setError("");
    setAiSource(null);
  }

  async function handleAiSuggest() {
    if (title.trim().length < 3) {
      setError("Nhập tiêu đề ≥ 3 ký tự để AI phân tích");
      return;
    }
    setError("");
    setAiLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/ai/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI không phản hồi");
        return;
      }
      const s = data.suggestion;
      setDescription(s.description);
      setStoryPoints(String(s.storyPoints));
      setPriority(s.priority);
      setSubtasks(s.subtasks ?? []);
      const matched = labels.filter((l) => s.labels.includes(l.name)).map((l) => l.id);
      setLabelIds(matched);
      setAiSource(s.source === "openai" ? "OpenAI" : "AI local");
    } catch {
      setError("Lỗi kết nối AI");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Tiêu đề là bắt buộc");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description || undefined,
          type,
          status,
          priority,
          storyPoints: storyPoints ? Number(storyPoints) : null,
          assigneeId: assigneeId || null,
          sprintId: sprintId || null,
          labelIds,
          subtasks,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tạo được task");
        return;
      }
      onOpenChange(false);
      onCreated();
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo task mới</DialogTitle>
          <DialogDescription>
            Mẹo: nhập tiêu đề rồi bấm ✨ AI để tự điền mô tả, points và subtasks
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Tiêu đề task..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAiSuggest}
              disabled={aiLoading}
              className="shrink-0"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-amber-400" />
              )}
              AI gợi ý
            </Button>
          </div>
          {aiSource && (
            <p className="text-xs text-emerald-400">
              ✓ Đã điền gợi ý từ {aiSource} — chỉnh sửa thoải mái trước khi lưu
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Mô tả</Label>
            <Textarea
              placeholder="Mô tả chi tiết, acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Loại</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
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
              <Label>Trạng thái</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
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
              <Label>Độ ưu tiên</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
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
              <Label>Story points</Label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="VD: 3"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={assigneeId || "none"} onValueChange={(v) => setAssigneeId(v === "none" ? "" : v)}>
                <SelectTrigger>
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
              <Label>Sprint</Label>
              <Select value={sprintId || "none"} onValueChange={(v) => setSprintId(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Không thuộc sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không thuộc sprint</SelectItem>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-1.5">
              {labels.map((l) => {
                const selected = labelIds.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() =>
                      setLabelIds((prev) =>
                        selected ? prev.filter((id) => id !== l.id) : [...prev, l.id]
                      )
                    }
                    className="rounded-full px-2.5 py-1 text-xs font-medium transition-all cursor-pointer"
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

          {subtasks.length > 0 && (
            <div className="space-y-1.5">
              <Label>Subtasks ({subtasks.length})</Label>
              <ul className="space-y-1 rounded-md border border-line bg-surface p-2">
                {subtasks.map((s, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => setSubtasks((prev) => prev.filter((_, j) => j !== i))}
                      className="text-muted hover:text-red-400 cursor-pointer"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
