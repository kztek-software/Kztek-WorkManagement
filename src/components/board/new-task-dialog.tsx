"use client";

import { useState } from "react";
import { Sparkles, Loader2, Plus } from "lucide-react";
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
  defaultSprintId,
  members,
  labels,
  sprints,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  open: boolean;
  defaultStatus: string;
  defaultSprintId?: string;
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
  const [sprintId, setSprintId] = useState(defaultSprintId || "");
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
    setSprintId(defaultSprintId || "");
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

  async function generateAiTask() {
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề sơ bộ để AI tự động gợi ý mô tả và checklist");
      return;
    }
    setError("");
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI không phản hồi");
        return;
      }
      if (data.description) setDescription(data.description);
      if (data.storyPoints) setStoryPoints(String(data.storyPoints));
      if (data.subtasks && Array.isArray(data.subtasks)) setSubtasks(data.subtasks);
      if (data.priority) setPriority(data.priority);
      setAiSource(data.source ?? "rule-based");
    } catch {
      setError("Lỗi kết nối AI");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          type,
          status,
          priority,
          storyPoints: storyPoints ? Number(storyPoints) : undefined,
          assigneeId: assigneeId || undefined,
          sprintId: sprintId || undefined,
          labelIds,
          subtasks: subtasks.map((st) => ({ title: st })),
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
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full max-w-2xl border border-line bg-surface p-4 sm:p-6 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pr-6">
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Tạo công việc mới</DialogTitle>
              <DialogDescription className="text-xs text-muted">
                Thêm task, bug, story hoặc epic vào quy trình của dự án
              </DialogDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateAiTask}
              disabled={aiLoading || !title.trim()}
              className="text-xs font-semibold border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 self-start sm:self-auto"
            >
              {aiLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-600" />
              )}
              AI Gợi ý chi tiết
            </Button>
          </div>
        </DialogHeader>

        {aiSource && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-600 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Đã tự động điền mô tả và checklist theo chuẩn AI KZTEK</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted">Tiêu đề công việc *</Label>
            <Input
              placeholder="VD: Nâng cấp bo mạch cảm biến KZ-S200..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9 bg-surface-2"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted">Mô tả chi tiết</Label>
            <Textarea
              placeholder="Mô tả yêu cầu, tiêu chí nghiệm thu (Acceptance Criteria)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="text-xs bg-surface-2 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Loại task</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="h-8 text-xs bg-surface-2">
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

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Trạng thái</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8 text-xs bg-surface-2">
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

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Độ ưu tiên</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-8 text-xs bg-surface-2">
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Điểm ước lượng (Story points)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="VD: 5"
                value={storyPoints}
                onChange={(e) => setStoryPoints(e.target.value)}
                className="text-xs h-8 bg-surface-2 font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Người phụ trách</Label>
              <Select value={assigneeId || "none"} onValueChange={(v) => setAssigneeId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs bg-surface-2">
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

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Sprint</Label>
              <Select value={sprintId || "none"} onValueChange={(v) => setSprintId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-8 text-xs bg-surface-2">
                  <SelectValue placeholder="Không thuộc sprint" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs text-muted">Không thuộc sprint</SelectItem>
                  {sprints.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Labels */}
          {labels.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Nhãn phân loại</Label>
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
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all cursor-pointer"
                      style={{
                        backgroundColor: selected ? l.color : `${l.color}15`,
                        color: selected ? "#fff" : l.color,
                        border: `1px solid ${l.color}40`,
                      }}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div className="space-y-1.5 rounded-xl border border-line bg-surface-2/40 p-3">
              <Label className="text-xs font-semibold text-muted">Checklist việc con ({subtasks.length})</Label>
              <ul className="space-y-1">
                {subtasks.map((s, i) => (
                  <li key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-surface border border-line">
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => setSubtasks((prev) => prev.filter((_, j) => j !== i))}
                      className="text-muted hover:text-accent cursor-pointer font-bold px-1"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-accent-subtle px-3 py-2 text-xs text-accent font-medium border border-accent/20">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" size="sm" disabled={loading} className="font-bold bg-accent hover:bg-accent/90 text-white">
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
              Tạo công việc
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
