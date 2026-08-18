"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Search,
  Plus,
  Filter,
  ExternalLink,
  KanbanSquare,
  Bug,
  HelpCircle,
  Sparkles,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Building,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Flame,
  ArrowUpDown,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "primereact/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { TicketDrawer } from "./ticket-drawer";
import type { CustomerTicketDto, SprintDto, MemberDto, ProjectDto } from "@/lib/types";

interface TicketListViewProps {
  project: ProjectDto;
  sprints: SprintDto[];
  members: MemberDto[];
  initialTickets: CustomerTicketDto[];
  initialStats: {
    total: number;
    open: number;
    triaged: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}

export function TicketListView({
  project,
  sprints,
  members,
  initialTickets,
  initialStats,
}: TicketListViewProps) {
  const [tickets, setTickets] = useState<CustomerTicketDto[]>(initialTickets);
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Selected Ticket for Drawer
  const [selectedTicket, setSelectedTicket] = useState<CustomerTicketDto | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Create Ticket Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"BUG" | "SUPPORT" | "FEATURE_REQ" | "INQUIRY">("BUG");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newEnvironment, setNewEnvironment] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function fetchTickets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/projects/${project.id}/tickets?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách ticket:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, typeFilter]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchTickets();
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");

    if (!newCustomerName.trim() || !newCustomerEmail.trim() || !newTitle.trim() || !newDescription.trim()) {
      setCreateError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim(),
          type: newType,
          priority: newPriority,
          customerName: newCustomerName.trim(),
          customerEmail: newCustomerEmail.trim(),
          customerPhone: newCustomerPhone.trim() || null,
          customerCompany: newCustomerCompany.trim() || null,
          environment: newEnvironment.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Không thể tạo ticket");
      } else {
        setCreateModalOpen(false);
        // Reset form
        setNewTitle("");
        setNewDescription("");
        setNewCustomerName("");
        setNewCustomerEmail("");
        setNewCustomerPhone("");
        setNewCustomerCompany("");
        setNewEnvironment("");
        await fetchTickets();
        setSelectedTicket(data.ticket);
        setDrawerOpen(true);
      }
    } catch (err) {
      console.error("Lỗi tạo ticket:", err);
      setCreateError("Lỗi kết nối máy chủ");
    } finally {
      setCreating(false);
    }
  }

  const statusBadges: Record<string, { label: string; bg: string; text: string; border: string }> = {
    OPEN: { label: "Mới tiếp nhận", bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
    TRIAGED: { label: "Đã phân loại", bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
    IN_PROGRESS: { label: "Đang xử lý", bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
    RESOLVED: { label: "Đã giải quyết", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    CLOSED: { label: "Đã đóng", bg: "bg-slate-500/15", text: "text-slate-400", border: "border-slate-500/30" },
    REJECTED: { label: "Từ chối", bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
  };

  const priorityBadges: Record<string, { label: string; text: string }> = {
    LOW: { label: "Thấp", text: "text-slate-400" },
    MEDIUM: { label: "Trung bình", text: "text-yellow-400" },
    HIGH: { label: "Cao", text: "text-orange-400" },
    URGENT: { label: "Khẩn cấp", text: "text-red-400 font-bold" },
  };

  const typeIcons: Record<string, any> = {
    BUG: Bug,
    SUPPORT: Wrench,
    FEATURE_REQ: Sparkles,
    INQUIRY: HelpCircle,
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 border-b border-line bg-surface/80 backdrop-blur-md shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/30 shadow-md">
              <LifeBuoy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Hộp Thư Ticket & Báo Lỗi Khách Hàng
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-accent/20 text-accent border border-accent/30">
                  {project.key}
                </span>
              </div>
              <p className="text-xs text-muted">
                Tiếp nhận sự cố từ portal công khai, phân loại và chuyển đổi trực tiếp sang Kanban Board.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href={`/portal/${project.key}`}
              target="_blank"
              className="h-9 px-3.5 rounded-xl border border-line bg-surface-2 hover:bg-surface-3 text-muted hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Cổng Portal Khách Hàng</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="h-9 px-4 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-md shadow-accent/25 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Ghi Nhận Ticket Mới</span>
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <div
            onClick={() => setStatusFilter("ALL")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "border-accent bg-accent/10 shadow-md ring-1 ring-accent/30"
                : "border-line bg-surface-2/60 hover:bg-surface-2"
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Tổng số ticket</div>
            <div className="text-xl font-black text-white mt-1">{stats.total}</div>
          </div>

          <div
            onClick={() => setStatusFilter("OPEN")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "OPEN"
                ? "border-blue-500 bg-blue-950/30 shadow-md ring-1 ring-blue-500/40"
                : "border-line bg-surface-2/60 hover:bg-surface-2"
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Mới tiếp nhận</div>
            <div className="text-xl font-black text-blue-400 mt-1">{stats.open}</div>
          </div>

          <div
            onClick={() => setStatusFilter("IN_PROGRESS")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "IN_PROGRESS"
                ? "border-amber-500 bg-amber-950/30 shadow-md ring-1 ring-amber-500/40"
                : "border-line bg-surface-2/60 hover:bg-surface-2"
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Đang xử lý / Kanban</div>
            <div className="text-xl font-black text-amber-400 mt-1">{stats.inProgress}</div>
          </div>

          <div
            onClick={() => setStatusFilter("RESOLVED")}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              statusFilter === "RESOLVED"
                ? "border-emerald-500 bg-emerald-950/30 shadow-md ring-1 ring-emerald-500/40"
                : "border-line bg-surface-2/60 hover:bg-surface-2"
            }`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Đã giải quyết</div>
            <div className="text-xl font-black text-emerald-400 mt-1">{stats.resolved}</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 sm:px-6 border-b border-line bg-surface/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã TK-XXXX, tiêu đề, tên hoặc email khách..."
            className="pl-9 h-8 bg-surface-2 border-line text-xs"
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-line bg-surface-2 text-xs font-semibold text-foreground focus:border-accent focus:outline-none"
          >
            <option value="ALL">Mọi trạng thái</option>
            <option value="OPEN">Mới (OPEN)</option>
            <option value="TRIAGED">Đã phân loại (TRIAGED)</option>
            <option value="IN_PROGRESS">Đang xử lý (IN_PROGRESS)</option>
            <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
            <option value="CLOSED">Đã đóng (CLOSED)</option>
            <option value="REJECTED">Từ chối (REJECTED)</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-line bg-surface-2 text-xs font-semibold text-foreground focus:border-accent focus:outline-none"
          >
            <option value="ALL">Mọi mức độ</option>
            <option value="URGENT">Khẩn cấp</option>
            <option value="HIGH">Cao</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="LOW">Thấp</option>
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-line bg-surface-2 text-xs font-semibold text-foreground focus:border-accent focus:outline-none"
          >
            <option value="ALL">Mọi loại lỗi</option>
            <option value="BUG">Lỗi phần mềm</option>
            <option value="SUPPORT">Hỗ trợ kỹ thuật</option>
            <option value="FEATURE_REQ">Tính năng mới</option>
            <option value="INQUIRY">Hỏi đáp</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTickets}
            className="h-8 px-2 text-xs text-muted hover:text-white"
            title="Tải lại danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Table / List View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {tickets.length === 0 ? (
          <div className="py-20 text-center space-y-3 rounded-2xl border border-line/60 bg-surface/30">
            <div className="w-12 h-12 rounded-full bg-surface-2 text-muted flex items-center justify-center mx-auto">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Chưa có ticket nào phù hợp</h3>
            <p className="text-xs text-muted max-w-sm mx-auto">
              Không tìm thấy ticket báo lỗi theo tiêu chí lọc hiện tại, hoặc chưa có khách hàng gửi báo lỗi.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface/90 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-line bg-surface-2/80 text-muted font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Mã Tra Cứu</th>
                    <th className="py-3 px-4">Tiêu Đề Sự Cố</th>
                    <th className="py-3 px-4">Khách Hàng</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4">Ưu Tiên</th>
                    <th className="py-3 px-4">Kanban Task</th>
                    <th className="py-3 px-4 text-right">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {tickets.map((t) => {
                    const statusMeta = statusBadges[t.status] || statusBadges.OPEN;
                    const priorityMeta = priorityBadges[t.priority] || priorityBadges.MEDIUM;
                    const TypeIcon = typeIcons[t.type] || Bug;

                    return (
                      <tr
                        key={t.id}
                        onClick={() => {
                          setSelectedTicket(t);
                          setDrawerOpen(true);
                        }}
                        className="hover:bg-surface-2/80 transition-colors cursor-pointer group"
                      >
                        {/* Tracking Code */}
                        <td className="py-3.5 px-4 font-mono font-bold text-accent">
                          <span className="group-hover:underline">{t.trackingCode}</span>
                        </td>

                        {/* Title & Type */}
                        <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                          <div className="flex items-center gap-1.5">
                            <TypeIcon className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span className="font-bold text-foreground group-hover:text-white transition-colors truncate">
                              {t.title}
                            </span>
                            {t._count && t._count.comments > 0 ? (
                              <span className="px-1.5 py-0.1 rounded text-[9px] bg-surface-3 text-muted border border-line">
                                {t._count.comments}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3.5 px-4">
                          <div className="truncate font-medium text-foreground">{t.customerName}</div>
                          <div className="truncate text-[10px] text-muted font-mono">{t.customerEmail}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4">
                          <span className={`text-[11px] font-semibold ${priorityMeta.text}`}>
                            {priorityMeta.label}
                          </span>
                        </td>

                        {/* Converted Kanban Task */}
                        <td className="py-3.5 px-4">
                          {t.convertedTaskId && t.convertedTask ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/40 text-purple-300 border border-purple-500/30">
                              <KanbanSquare className="w-3 h-3 text-purple-400" />
                              <span>#{t.convertedTask.number}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted">Chưa tạo</span>
                          )}
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-4 text-right text-[11px] text-muted font-mono">
                          {format(new Date(t.createdAt), "dd/MM/yyyy HH:mm")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Details Drawer */}
      <TicketDrawer
        ticket={selectedTicket}
        projectId={project.id}
        sprints={sprints}
        members={members}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onTicketUpdated={async () => {
          await fetchTickets();
          if (selectedTicket) {
            const res = await fetch(`/api/projects/${project.id}/tickets/${selectedTicket.id}`);
            const data = await res.json();
            if (res.ok) setSelectedTicket(data.ticket);
          }
        }}
      />

      {/* ========================================================================= */}
      {/* MODAL: TẠO TICKET BÁO LỖI NỘI BỘ (STAFF INTAKE MODAL)                    */}
      {/* ========================================================================= */}
      <Dialog
        header="Ghi Nhận Ticket Báo Lỗi Khách Hàng (Nội Bộ)"
        visible={createModalOpen}
        onHide={() => setCreateModalOpen(false)}
        className="w-full max-w-lg border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 pt-2 text-xs">
          {createError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tên khách hàng *</Label>
              <Input
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Nguyễn Văn A..."
                className="h-8 bg-surface-2 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email khách hàng *</Label>
              <Input
                type="email"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                placeholder="customer@domain.com..."
                className="h-8 bg-surface-2 text-xs"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Số điện thoại</Label>
              <Input
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="0912..."
                className="h-8 bg-surface-2 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Đơn vị / Công ty</Label>
              <Input
                value={newCustomerCompany}
                onChange={(e) => setNewCustomerCompany(e.target.value)}
                placeholder="KZTEK..."
                className="h-8 bg-surface-2 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Phân loại</Label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full h-8 px-2.5 rounded-lg border border-line bg-surface-2 text-xs font-medium focus:border-accent"
              >
                <option value="BUG">Báo lỗi phần mềm (BUG)</option>
                <option value="SUPPORT">Hỗ trợ kỹ thuật (SUPPORT)</option>
                <option value="FEATURE_REQ">Tính năng mới (FEATURE_REQ)</option>
                <option value="INQUIRY">Hỏi đáp & Tư vấn (INQUIRY)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Mức độ ưu tiên</Label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full h-8 px-2.5 rounded-lg border border-line bg-surface-2 text-xs font-medium focus:border-accent"
              >
                <option value="LOW">Thấp (LOW)</option>
                <option value="MEDIUM">Trung bình (MEDIUM)</option>
                <option value="HIGH">Cao (HIGH)</option>
                <option value="URGENT">Khẩn cấp (URGENT)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tiêu đề sự cố *</Label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tóm tắt sự cố khách hàng phản ánh..."
              className="h-8 bg-surface-2 text-xs font-semibold"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Mô tả chi tiết *</Label>
            <Textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Chi tiết phản ánh từ khách hàng..."
              rows={3}
              className="bg-surface-2 text-xs"
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Môi trường / Thiết bị</Label>
            <Input
              value={newEnvironment}
              onChange={(e) => setNewEnvironment(e.target.value)}
              placeholder="VD: App mobile v2.1, iOS 17..."
              className="h-8 bg-surface-2 text-xs"
            />
          </div>

          <div className="pt-3 border-t border-line flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={creating}
              className="bg-accent hover:bg-accent-hover text-white font-bold cursor-pointer"
            >
              {creating ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
              <span>Lưu & Sinh Mã Tra Cứu</span>
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
