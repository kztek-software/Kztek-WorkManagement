"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Send,
  MessageSquare,
  User,
  Mail,
  Phone,
  Building,
  Laptop,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KanbanSquare,
  Sparkles,
  Bug,
  HelpCircle,
  Wrench,
  Shield,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
  Lock,
  FolderKanban,
  ArrowRightLeft,
  AlertTriangle,
} from "lucide-react";
import { Dialog } from "primereact/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { MediaGallery } from "@/components/ui/media-gallery";
import { FileUploadZone, type UploadedFileItem } from "@/components/ui/file-upload-zone";
import type { CustomerTicketDto, SprintDto, MemberDto, AttachmentDto } from "@/lib/types";

interface TicketDrawerProps {
  ticket: CustomerTicketDto | null;
  projectId: string;
  sprints: SprintDto[];
  members: MemberDto[];
  allProjects?: Array<{ id: string; name: string; key: string }>;
  userRole?: string;
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: () => void;
}

export function TicketDrawer({
  ticket,
  projectId,
  sprints,
  members,
  allProjects = [],
  userRole,
  isOpen,
  onClose,
  onTicketUpdated,
}: TicketDrawerProps) {
  const [status, setStatus] = useState(ticket?.status || "OPEN");
  const [priority, setPriority] = useState(ticket?.priority || "MEDIUM");
  const [type, setType] = useState(ticket?.type || "ISSUE");
  const [internalNotes, setInternalNotes] = useState(ticket?.internalNotes || "");
  const [resolutionNotes, setResolutionNotes] = useState(ticket?.resolutionNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  // Comment state
  const [newComment, setNewComment] = useState("");
  const [isInternalOnly, setIsInternalOnly] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // Dispatch state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState(ticket?.projectId || projectId);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState("");

  // Convert to Task state
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [convertSprintId, setConvertSprintId] = useState<string>("");
  const [convertAssigneeId, setConvertAssigneeId] = useState<string>("");
  const [convertStatus, setConvertStatus] = useState<"TODO" | "BACKLOG" | "IN_PROGRESS">("TODO");
  const [convertCustomTitle, setConvertCustomTitle] = useState("");
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState("");

  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setPriority(ticket.priority);
      setType(ticket.type);
      setInternalNotes(ticket.internalNotes || "");
      setResolutionNotes(ticket.resolutionNotes || "");
      setConvertCustomTitle(`[${ticket.trackingCode}] ${ticket.title}`);
      setTargetProjectId(ticket.projectId || projectId);
    }
  }, [ticket, projectId]);

  if (!isOpen || !ticket) return null;

  async function handleDispatch() {
    if (!targetProjectId) {
      setDispatchError("Vui lòng chọn dự án đích");
      return;
    }
    setDispatching(true);
    setDispatchError("");
    try {
      const res = await fetch(`/api/tickets/${ticket!.id}/dispatch`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetProjectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDispatchError(data.error || "Không thể điều phối ticket");
      } else {
        setDispatchModalOpen(false);
        onTicketUpdated();
      }
    } catch (err) {
      console.error("Lỗi điều phối:", err);
      setDispatchError("Lỗi kết nối khi điều phối ticket");
    } finally {
      setDispatching(false);
    }
  }

  async function handleQuickUpdate(newStatus?: string, newPriority?: string, newType?: string) {
    try {
      const res = await fetch(`/api/projects/${projectId}/tickets/${ticket!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus || status,
          priority: newPriority || priority,
          type: newType || type,
        }),
      });
      if (res.ok) {
        if (newStatus) setStatus(newStatus);
        if (newPriority) setPriority(newPriority);
        if (newType) setType(newType);
        onTicketUpdated();
      }
    } catch (err) {
      console.error("Lỗi cập nhật ticket:", err);
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tickets/${ticket!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internalNotes,
          resolutionNotes,
          status: resolutionNotes.trim() && status === "OPEN" ? "RESOLVED" : status,
        }),
      });
      if (res.ok) {
        onTicketUpdated();
      }
    } catch (err) {
      console.error("Lỗi lưu ghi chú:", err);
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSendingComment(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tickets/${ticket!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newComment: {
            message: newComment.trim(),
            isInternalOnly,
          },
        }),
      });
      if (res.ok) {
        setNewComment("");
        onTicketUpdated();
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    } finally {
      setSendingComment(false);
    }
  }

  async function handleConvert() {
    setConverting(true);
    setConvertError("");

    try {
      const res = await fetch(`/api/projects/${projectId}/tickets/${ticket!.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sprintId: convertSprintId || null,
          assigneeId: convertAssigneeId || null,
          status: convertStatus,
          customTitle: convertCustomTitle.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setConvertError(data.error || "Không thể chuyển đổi ticket");
      } else {
        setConvertModalOpen(false);
        onTicketUpdated();
      }
    } catch (err) {
      console.error("Lỗi convert:", err);
      setConvertError("Lỗi kết nối máy chủ");
    } finally {
      setConverting(false);
    }
  }

  async function handleDeleteAttachment(attachmentId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa tệp đính kèm này?")) return;
    try {
      const res = await fetch(`/api/attachments/${attachmentId}`, { method: "DELETE" });
      if (res.ok) onTicketUpdated();
    } catch (err) {
      console.error("Lỗi xóa attachment:", err);
    }
  }

  async function handleUploadAdditionalFiles(newFiles: UploadedFileItem[]) {
    const unattached = newFiles.filter((f) => !f.id);
    for (const file of unattached) {
      try {
        await fetch("/api/attachments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticketId: ticket!.id,
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileType: file.fileType,
            fileSize: file.fileSize,
            mimeType: file.mimeType,
          }),
        });
      } catch (err) {
        console.error("Lỗi lưu attachment:", err);
      }
    }
    onTicketUpdated();
  }

  function copyTracking() {
    navigator.clipboard.writeText(ticket!.trackingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  const statusList = [
    { id: "OPEN", label: "Mới tiếp nhận (OPEN)", color: "text-blue-400" },
    { id: "TRIAGED", label: "Đã phân loại (TRIAGED)", color: "text-purple-400" },
    { id: "IN_PROGRESS", label: "Đang xử lý (IN_PROGRESS)", color: "text-amber-400" },
    { id: "RESOLVED", label: "Đã giải quyết (RESOLVED)", color: "text-emerald-400" },
    { id: "CLOSED", label: "Đã đóng (CLOSED)", color: "text-slate-400" },
    { id: "REJECTED", label: "Từ chối / Spam (REJECTED)", color: "text-accent" },
  ];

  const priorityList = [
    { id: "LOW", label: "Thấp (LOW)" },
    { id: "MEDIUM", label: "Trung bình (MEDIUM)" },
    { id: "HIGH", label: "Cao (HIGH)" },
    { id: "URGENT", label: "Khẩn cấp (URGENT)" },
  ];

  return (
    <>
      <Dialog
        visible={isOpen}
        onHide={onClose}
        header={
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-black text-accent bg-accent/15 px-2 py-0.5 rounded border border-accent/30 flex items-center gap-1.5">
                <span>{ticket.trackingCode}</span>
                <button
                  type="button"
                  onClick={copyTracking}
                  className="hover:text-white cursor-pointer"
                  title="Chép mã"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </span>
              <span className="text-xs font-bold text-white truncate max-w-md">{ticket.title}</span>
            </div>

            <Link
              href={`/portal/tickets/${ticket.trackingCode}`}
              target="_blank"
              className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Xem trang Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        }
        className="w-full max-w-4xl border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <div className="space-y-6 pt-2 max-h-[80vh] overflow-y-auto pr-1">
          {/* Top Quick Actions Bar */}
          <div className="p-4 rounded-xl border border-line bg-surface-2/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Status Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Trạng thái</span>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    handleQuickUpdate(e.target.value);
                  }}
                  className="h-8 px-2.5 rounded-lg border border-line bg-surface-3 text-xs font-bold text-foreground focus:border-accent focus:outline-none"
                >
                  {statusList.map((s) => (
                    <option key={s.id} value={s.id} className={s.color}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Ưu tiên</span>
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value);
                    handleQuickUpdate(undefined, e.target.value);
                  }}
                  className="h-8 px-2.5 rounded-lg border border-line bg-surface-3 text-xs font-bold text-foreground focus:border-accent focus:outline-none"
                >
                  {priorityList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Project Assignment & Dispatch Badge */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">Dự án phụ trách</span>
                <div className="flex items-center gap-1.5">
                  {ticket.project ? (
                    <span className="h-8 px-2.5 rounded-lg border border-line bg-surface-3 text-xs font-bold text-foreground flex items-center gap-1.5">
                      <FolderKanban className="w-3.5 h-3.5 text-accent" />
                      <span>{ticket.project.name}</span>
                    </span>
                  ) : (
                    <span className="h-8 px-2.5 rounded-lg border border-amber-500/30 bg-amber-500/15 text-xs font-bold text-amber-600 flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Chờ điều phối</span>
                    </span>
                  )}

                  {allProjects && allProjects.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDispatchModalOpen(true)}
                      className="h-8 px-2.5 text-xs border-line hover:border-accent text-muted hover:text-white cursor-pointer flex items-center gap-1"
                      title="Điều phối ticket tới dự án cụ thể"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-accent" />
                      <span>{ticket.projectId ? "Chuyển dự án" : "Điều phối dự án"}</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 1-Click Convert to Task Button */}
            <div className="flex items-center gap-2">
              {ticket.convertedTaskId && ticket.convertedTask ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs">
                  <KanbanSquare className="w-4 h-4 text-purple-400" />
                  <span>
                    Đã chuyển đổi: <strong>Task #{ticket.convertedTask.number}</strong> ({ticket.convertedTask.status})
                  </span>
                  <Link
                    href={`/projects/${projectId}/board`}
                    className="ml-1 text-accent hover:underline font-bold"
                  >
                    Xem Board
                  </Link>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => setConvertModalOpen(true)}
                  className="h-9 px-4 bg-gradient-to-r from-[#F05922] to-[#FF8C00] hover:from-[#FF6B35] hover:to-[#FFA500] text-white font-bold text-xs rounded-xl shadow-md shadow-accent/25 cursor-pointer flex items-center gap-1.5"
                >
                  <KanbanSquare className="w-4 h-4" />
                  <span>Chuyển thành Task/Bug trên Board</span>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Customer info & Original Description */}
            <div className="md:col-span-2 space-y-5">
              {/* Customer Contact Details */}
              <div className="p-4 rounded-xl border border-line bg-surface-2/40 space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">
                  Thông tin khách hàng báo lỗi
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-foreground">
                    <User className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>Họ tên: <strong className="text-white">{ticket.customerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-foreground">
                    <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                    <span>Email: <strong className="font-mono text-accent">{ticket.customerEmail}</strong></span>
                  </div>
                  {ticket.customerPhone && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span>SĐT: <strong className="font-mono">{ticket.customerPhone}</strong></span>
                    </div>
                  )}
                  {ticket.customerCompany && (
                    <div className="flex items-center gap-2 text-foreground">
                      <Building className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span>Đơn vị: <strong>{ticket.customerCompany}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Issue Description */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">Chi tiết sự cố:</span>
                <div className="p-4 rounded-xl bg-surface-2 border border-line text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </div>
                {ticket.environment && (
                  <div className="flex items-center gap-2 text-xs text-muted pt-1">
                    <Laptop className="w-4 h-4 text-muted shrink-0" />
                    <span>Môi trường: <strong className="text-foreground">{ticket.environment}</strong></span>
                  </div>
                )}

                {/* Media Gallery for Attachments */}
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <div className="pt-2">
                    <MediaGallery
                      attachments={ticket.attachments}
                      canDelete
                      onDelete={handleDeleteAttachment}
                      title="Tệp đính kèm / Ảnh / Video sự cố"
                    />
                  </div>
                )}

                {/* Staff Upload Additional Attachments */}
                <div className="pt-2">
                  <FileUploadZone
                    files={[]}
                    onChange={handleUploadAdditionalFiles}
                    compact
                    label="Tải thêm ảnh / video / tài liệu đính kèm"
                    helperText="Tải thêm tài liệu kỹ thuật hoặc hình ảnh minh họa cho ticket này"
                  />
                </div>
              </div>

              {/* Internal Notes & Resolution Notes Editor */}
              <div className="space-y-4 pt-2 border-t border-line/60">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Ghi chú nội bộ (Chỉ nhân viên thấy)</span>
                    </Label>
                  </div>
                  <Textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Ghi chú kỹ thuật, nguyên nhân gốc rễ, phân công nội bộ..."
                    rows={2}
                    className="bg-surface-2 border-amber-500/20 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ghi chú kết quả xử lý (Hiển thị cho khách hàng trên Portal)</span>
                  </Label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Mô tả hướng dẫn hoặc kết quả khắc phục sự cố cho khách hàng..."
                    rows={3}
                    className="bg-surface-2 border-emerald-500/20 text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="h-8 px-4 bg-surface-3 hover:bg-accent text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    {savingNotes ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
                    <span>Lưu ghi chú</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right: Message & Comment Log */}
            <div className="space-y-4 p-4 rounded-xl border border-line bg-surface-2/40 flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-line/60 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <span>Trao đổi ({ticket.comments?.length || 0})</span>
                </span>
                <span className="text-[10px] text-muted">Thời gian thực</span>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {!ticket.comments || ticket.comments.length === 0 ? (
                  <p className="text-xs text-muted text-center py-10">Chưa có bình luận trao đổi nào</p>
                ) : (
                  ticket.comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-lg border text-xs leading-relaxed space-y-1 ${
                        c.isInternalOnly
                          ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                          : c.isStaff
                          ? "bg-accent/15 border-accent/30 text-foreground"
                          : "bg-surface-3 border-line text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-bold text-white text-[11px]">{c.authorName}</span>
                          {c.isStaff && (
                            <span className="px-1 py-0.1 rounded text-[8px] font-bold bg-accent text-white">
                              Staff
                            </span>
                          )}
                          {c.isInternalOnly && (
                            <span className="px-1 py-0.1 rounded text-[8px] font-bold bg-amber-500 text-black flex items-center gap-0.5">
                              <EyeOff className="w-2.5 h-2.5" />
                              <span>Nội bộ</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-muted font-mono">
                          {format(new Date(c.createdAt), "HH:mm dd/MM")}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-[11px]">{c.message}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Send Comment Input */}
              <form onSubmit={handleAddComment} className="pt-2 border-t border-line/60 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Nhập phản hồi gửi khách hàng hoặc ghi chú..."
                  rows={2}
                  className="bg-surface-3 border-line text-xs"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={isInternalOnly}
                      onChange={(e) => setIsInternalOnly(e.target.checked)}
                      className="rounded border-line bg-surface-3 text-accent focus:ring-0"
                    />
                    <span>Chỉ nội bộ (Khách không thấy)</span>
                  </label>

                  <Button
                    type="submit"
                    disabled={sendingComment || !newComment.trim()}
                    className="h-7 px-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    {sendingComment ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                    <span>Gửi</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Dialog>

      {/* ========================================================================= */}
      {/* MODAL: CHUYỂN ĐỔI TICKET THÀNH TASK TRÊN KANBAN BOARD                     */}
      {/* ========================================================================= */}
      <Dialog
        header="Chuyển Đổi Ticket Thành Task/Bug Trên Board"
        visible={convertModalOpen}
        onHide={() => setConvertModalOpen(false)}
        className="w-full max-w-md border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <div className="space-y-4 pt-2 text-xs">
          {convertError && (
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 text-accent">
              {convertError}
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-bold">Tiêu đề Task trên Board</Label>
            <Input
              value={convertCustomTitle}
              onChange={(e) => setConvertCustomTitle(e.target.value)}
              className="h-9 bg-surface-2 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Cột trạng thái ban đầu</Label>
            <select
              value={convertStatus}
              onChange={(e) => setConvertStatus(e.target.value as any)}
              className="w-full h-9 px-3 rounded-xl border border-line bg-surface-2 text-xs font-medium focus:border-accent"
            >
              <option value="TODO">Cần làm (To do)</option>
              <option value="BACKLOG">Tồn đọng (Backlog)</option>
              <option value="IN_PROGRESS">Đang thực hiện (In progress)</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Gán vào Sprint (Tùy chọn)</Label>
            <select
              value={convertSprintId}
              onChange={(e) => setConvertSprintId(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-line bg-surface-2 text-xs font-medium focus:border-accent"
            >
              <option value="">-- Không gán sprint (Product Backlog) --</option>
              {sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">Người phụ trách xử lý</Label>
            <select
              value={convertAssigneeId}
              onChange={(e) => setConvertAssigneeId(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-line bg-surface-2 text-xs font-medium focus:border-accent"
            >
              <option value="">-- Chưa chỉ định --</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name} ({m.user.title || m.role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-line flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConvertModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={converting}
              onClick={handleConvert}
              className="bg-accent hover:bg-accent-hover text-white font-bold cursor-pointer"
            >
              {converting ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <KanbanSquare className="w-3.5 h-3.5 mr-1.5" />}
              <span>Tạo Task & Chuyển Đổi</span>
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Admin Dispatch Modal */}
      <Dialog
        visible={dispatchModalOpen}
        onHide={() => setDispatchModalOpen(false)}
        header={
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <ArrowRightLeft className="w-4 h-4 text-accent" />
            <span>Điều Phối Ticket Tới Dự Án Cụ Thể (Admin)</span>
          </div>
        }
        className="w-full max-w-md border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <div className="space-y-4 pt-2">
          {dispatchError && (
            <div className="p-3 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-accent shrink-0" />
              <span>{dispatchError}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-surface-2 border border-line text-xs space-y-1">
            <div className="font-bold text-foreground truncate">{ticket.title}</div>
            <div className="text-muted">
              Khách hàng: <strong>{ticket.customerName}</strong> ({ticket.customerEmail})
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Chọn Dự án phụ trách xử lý sự cố này:</Label>
            <select
              value={targetProjectId}
              onChange={(e) => setTargetProjectId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-line bg-surface-2 text-xs font-semibold text-foreground focus:border-accent focus:outline-none"
            >
              {allProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-[11px] text-muted-light space-y-1">
            <p className="font-bold text-accent">💡 Sau khi điều phối:</p>
            <ul className="list-disc list-inside space-y-0.5 text-muted">
              <li>Ticket tự động chuyển sang trạng thái <strong>TRIAGED (Đã phân loại)</strong>.</li>
              <li>Hệ thống gửi thông báo tới đội ngũ kỹ thuật của dự án đích.</li>
              <li>Kỹ sư dự án có thể bấm 1-Click chuyển đổi ticket thành Kanban Task.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDispatchModalOpen(false)}
              className="text-xs text-muted hover:text-white"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              onClick={handleDispatch}
              disabled={dispatching}
              className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-4"
            >
              {dispatching ? "Đang điều phối..." : "Xác nhận Điều Phối"}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
