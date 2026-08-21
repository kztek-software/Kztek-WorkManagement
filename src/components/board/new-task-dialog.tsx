"use client";

import { useState, useRef } from "react";
import {
  Sparkles,
  Loader2,
  Plus,
  FileText,
  CheckSquare,
  X,
  Eye,
  Pencil,
  Tag,
  Paperclip,
} from "lucide-react";
import { STATUSES, PRIORITIES, TASK_TYPES } from "@/lib/constants";
import type { LabelDto, MemberDto, SprintDto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { WysiwygEditor } from "@/components/ui/wysiwyg-editor";
import { FileUploadZone, type UploadedFileItem } from "@/components/ui/file-upload-zone";

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
  const [newSubtask, setNewSubtask] = useState("");
  const [attachments, setAttachments] = useState<UploadedFileItem[]>([]);
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
    setNewSubtask("");
    setAttachments([]);
    setError("");
    setAiSource(null);
  }

  function handleAddSubtask(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [...prev, newSubtask.trim()]);
    setNewSubtask("");
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
          attachments: attachments.map((att) => ({
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileType: att.fileType,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
          })),
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

  const dialogHeader = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-6 w-full">
      <div>
        <div className="text-sm sm:text-base font-bold text-foreground">Tạo công việc mới</div>
        <div className="text-[11px] sm:text-xs text-muted font-normal">
          Thêm task, bug, story hoặc epic kèm tài liệu, hình ảnh và checklist
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={generateAiTask}
        disabled={aiLoading || !title.trim()}
        title="AI Gợi ý chi tiết (Alt+A)"
        className="text-xs font-semibold border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 self-start sm:self-auto gap-1 h-7.5 sm:h-8"
      >
        {aiLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-600" />
        )}
        <span>AI Gợi ý chi tiết</span>
        <kbd className="hidden sm:inline-block px-1 py-0.2 text-[9px] font-mono font-bold bg-amber-500/20 text-amber-700 rounded border border-amber-500/30">
          Alt+A
        </kbd>
      </Button>
    </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      visible={open}
      onHide={() => onOpenChange(false)}
      className="w-[96vw] sm:w-[92vw] max-w-4xl border border-line bg-surface p-0 shadow-2xl rounded-2xl"
    >
      <div className="p-3.5 sm:p-5 pt-1.5 max-h-[84vh] overflow-y-auto pr-1 sm:pr-2">
        {aiSource && (
          <div className="mb-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-600 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>Đã tự động điền mô tả và checklist theo chuẩn AI KZTEK</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              handleSubmit(e);
            }
            if (e.altKey && e.key.toLowerCase() === "a") {
              e.preventDefault();
              generateAiTask();
            }
          }}
          className="space-y-3 sm:space-y-3.5"
        >
          {/* Tiêu đề công việc */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-muted">Tiêu đề công việc *</Label>
            <Input
              placeholder="VD: Nâng cấp bo mạch cảm biến KZ-S200..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-8.5 sm:h-9 bg-surface-2"
              required
              autoFocus
            />
          </div>

          {/* 6 trường thuộc tính cốt lõi: 2 hàng 3 cột */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Loại task</Label>
              <Dropdown
                value={type}
                options={TASK_TYPES.map((t) => ({ label: t.label, value: t.id }))}
                onChange={(e) => setType(e.value)}
                className="h-8 w-full text-xs bg-surface-2 border border-line rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Trạng thái</Label>
              <Dropdown
                value={status}
                options={STATUSES.map((s) => ({ label: s.label, value: s.id }))}
                onChange={(e) => setStatus(e.value)}
                className="h-8 w-full text-xs bg-surface-2 border border-line rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Độ ưu tiên</Label>
              <Dropdown
                value={priority}
                options={PRIORITIES.map((p) => ({ label: p.label, value: p.id }))}
                onChange={(e) => setPriority(e.value)}
                className="h-8 w-full text-xs bg-surface-2 border border-line rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
              <Dropdown
                value={assigneeId || "none"}
                options={[
                  { label: "Chưa giao việc", value: "none", teamName: "" },
                  ...members.map((m) => ({
                    label: `${m.user.name} (${m.role})`,
                    value: m.user.id,
                    user: m.user,
                    teamName: m.user.team?.name || "",
                  })),
                ]}
                filter
                filterBy="label,teamName,user.email,user.name"
                filterPlaceholder="Tìm tên, nhóm, email..."
                resetFilterOnHide
                panelClassName="border border-line bg-surface rounded-2xl shadow-2xl p-1 text-xs min-w-[250px]"
                onChange={(e) => setAssigneeId(e.value === "none" ? "" : e.value)}
                className="h-8 w-full text-xs bg-surface-2 border border-line rounded-lg"
                itemTemplate={(opt) => {
                  if (opt.value === "none") {
                    return <span className="text-xs text-muted py-1">Chưa giao việc</span>;
                  }
                  return (
                    <div className="flex items-center justify-between gap-2 text-xs py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {opt.user && (
                          <Avatar className="h-5 w-5 -ml-0.5 shrink-0">
                            <AvatarFallback color={opt.user.avatarColor} className="text-[7.5px] font-bold">
                              {initials(opt.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">{opt.user?.name || opt.label}</div>
                          <div className="flex items-center gap-1 text-[10px] text-muted truncate">
                            {opt.user?.team && (
                              <span
                                className="font-semibold px-1 rounded text-[9px] shrink-0"
                                style={{
                                  backgroundColor: `${opt.user.team.color || "#F05922"}20`,
                                  color: opt.user.team.color || "#F05922",
                                }}
                              >
                                {opt.user.team.name}
                              </span>
                            )}
                            <span className="truncate">{opt.user?.email || opt.user?.title}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted">Sprint</Label>
              <Dropdown
                value={sprintId || "none"}
                options={[
                  { label: "Không thuộc sprint (Backlog)", value: "none" },
                  ...sprints.map((s) => ({
                    label: `🚀 ${s.name} (${s.status === "ACTIVE" ? "Đang chạy" : s.status === "COMPLETED" ? "Đã xong" : "Kế hoạch"})`,
                    value: s.id,
                  })),
                ]}
                onChange={(e) => setSprintId(e.value === "none" ? "" : e.value)}
                className="h-8 w-full text-xs bg-surface-2 border border-line rounded-lg"
              />
            </div>
          </div>

          {/* VÙNG GIỮA: 2 Cột Cân Đối (Mô tả chi tiết & Danh sách việc con) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-0.5">
            {/* Cột Trái: Mô tả chi tiết */}
            <div className="flex flex-col space-y-1 rounded-xl border border-line bg-surface-2/30 p-2.5 sm:p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                  Mô tả chi tiết
                </Label>
                <span className="text-[10px] text-muted">1. 2. 3., in đậm, màu trực quan</span>
              </div>

              <WysiwygEditor
                value={description}
                onChange={setDescription}
                placeholder="Mô tả yêu cầu, tiêu chí nghiệm thu... (Định dạng trực quan: in đậm, đổi màu chữ, danh sách 1. 2. 3., highlight, tiêu đề...)"
                minHeight="125px"
              />
            </div>

            {/* Cột Phải: Danh sách việc con (Checklist) */}
            <div className="flex flex-col space-y-1.5 rounded-xl border border-line bg-surface-2/30 p-2.5 sm:p-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-accent" />
                  Danh sách việc con (Checklist)
                </Label>
                <span className="text-[10px] font-bold text-muted bg-surface border border-line px-2 py-0.5 rounded-full font-mono">
                  {subtasks.length} mục
                </span>
              </div>

              {/* Input thêm việc con nhanh */}
              <div className="flex gap-1.5">
                <Input
                  placeholder="Nhập việc con mới (Enter để thêm)..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddSubtask();
                    }
                  }}
                  className="h-8 text-xs bg-surface"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handleAddSubtask()}
                  disabled={!newSubtask.trim()}
                  className="h-8 px-2.5 text-xs font-bold shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 mr-0.5" /> Thêm
                </Button>
              </div>

              {/* Danh sách các subtasks */}
              <div className="min-h-[105px] max-h-[145px] overflow-y-auto space-y-1 pr-0.5">
                {subtasks.length > 0 ? (
                  <ul className="space-y-1">
                    {subtasks.map((s, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2 text-xs px-2.5 py-1.5 rounded-lg bg-surface border border-line hover:border-line-strong transition-all group"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                          <span className="truncate text-foreground font-medium">{s}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSubtasks((prev) => prev.filter((_, j) => j !== i))}
                          className="text-muted hover:text-accent hover:bg-accent/10 rounded p-0.5 cursor-pointer transition-colors"
                          title="Xóa việc con này"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="h-full min-h-[95px] flex flex-col items-center justify-center text-center p-2.5 border border-dashed border-line rounded-lg text-muted">
                    <CheckSquare className="h-4.5 w-4.5 text-muted/40 mb-1" />
                    <p className="text-[11px] font-medium">Chưa có việc con nào</p>
                    <p className="text-[10px] text-muted/70">
                      Nhập ở trên hoặc nhấn <strong className="text-accent">Alt+A</strong> để AI tự tạo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* VÙNG ĐÍNH KÈM TỆP TIN & MEDIA */}
          <div className="space-y-1 rounded-xl border border-line bg-surface-2/30 p-2.5 sm:p-3">
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-accent" />
                Đính kèm tệp tin & tài liệu
              </Label>
              <span className="text-[10px] text-muted font-mono">
                {attachments.length} tệp đã chọn
              </span>
            </div>

            <FileUploadZone
              files={attachments}
              onChange={setAttachments}
              compact={true}
              maxFiles={10}
              label="Kéo thả hoặc bấm để đính kèm ảnh chụp, video lỗi hoặc tài liệu"
              helperText="Hỗ trợ PNG, JPG, WebP, MP4, WebM, MOV, PDF, DOCX, XLSX, TXT, LOG, ZIP (Tối đa 25MB/tệp, 100MB/video)"
            />
          </div>

          {/* Labels */}
          {labels.length > 0 && (
            <div className="space-y-1 pt-0.5">
              <Label className="text-xs font-semibold text-muted flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted" />
                Nhãn phân loại
              </Label>
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

          {error && (
            <p className="rounded-lg bg-accent-subtle px-3 py-2 text-xs text-accent font-medium border border-accent/20">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2.5 border-t border-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer h-8 text-xs"
            >
              <span>Hủy</span>
              <kbd className="hidden sm:inline-block text-[10px] text-muted opacity-70 ml-1 font-mono">
                Esc
              </kbd>
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="font-bold bg-accent hover:bg-accent/90 text-white shadow-sm cursor-pointer gap-1.5 h-8 text-xs"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-1" />
              )}
              <span>Tạo công việc</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono font-bold bg-white/20 text-white rounded border border-white/30">
                Ctrl+Enter
              </kbd>
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}


