"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
  defaultDropAnimationSideEffects,
  type DropAnimation,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Plus,
  Search,
  Wifi,
  WifiOff,
  Filter,
  Users,
  Shield,
  Eye,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { STATUSES, PRIORITIES, TASK_TYPES } from "@/lib/constants";
import type { BoardData, TaskDto } from "@/lib/types";
import { canCreateTask, isViewer } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BoardColumn } from "@/components/board/board-column";
import { TaskCard } from "@/components/board/task-card";
import { TaskDialog } from "@/components/board/task-dialog";
import { NewTaskDialog } from "@/components/board/new-task-dialog";
import { NotionDialog } from "@/components/notion/notion-dialog";
import { MemberDialog } from "@/components/project/member-dialog";

const PRIORITY_ORDER: Record<string, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.35",
      },
    },
  }),
  duration: 220,
  easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
};

export default function BoardPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const searchParams = useSearchParams();
  const urlTaskId = searchParams.get("taskId");
  const urlSprintId = searchParams.get("sprintId");

  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  // Filters State
  const [search, setSearch] = useState("");
  const [sprintFilter, setSprintFilter] = useState<string>(urlSprintId || "ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [timeFilter, setTimeFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Sorting State
  const [sortBy, setSortBy] = useState<string>("MANUAL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialogs State
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState("TODO");
  const [notionOpen, setNotionOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (urlTaskId) {
      setOpenTaskId(urlTaskId);
    }
  }, [urlTaskId]);

  useEffect(() => {
    if (urlSprintId) {
      setSprintFilter(urlSprintId);
    }
  }, [urlSprintId]);

  const loadBoard = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setNewTaskStatus("TODO");
        setNewTaskOpen(true);
      } else if (e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setNotionOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Realtime SSE
  useEffect(() => {
    const es = new EventSource(`/api/projects/${projectId}/stream`);
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "CONNECTED") {
          setConnected(true);
          return;
        }
        loadBoard();
      } catch {
        // ignore
      }
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [projectId, loadBoard]);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 4 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 6 },
  });
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 4 },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, touchSensor, pointerSensor, keyboardSensor);

  const collisionDetectionStrategy: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return closestCorners(args);
  }, []);

  // Filter & Sort Calculation
  const tasksByStatus = useMemo(() => {
    const map: Record<string, TaskDto[]> = {};
    for (const s of STATUSES) map[s.id] = [];
    if (!data) return map;

    const q = search.trim().toLowerCase();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 86400000 - 1);
    const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);

    const filtered = data.tasks.filter((t) => {
      if (q) {
        const matchKey = `${data.project.key}-${t.number}`.toLowerCase().includes(q);
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchKey && !matchTitle && !matchDesc) return false;
      }

      if (sprintFilter !== "ALL") {
        if (sprintFilter === "NONE" && t.sprintId) return false;
        if (sprintFilter !== "NONE" && t.sprintId !== sprintFilter) return false;
      }

      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;

      if (assigneeFilter !== "ALL") {
        if (assigneeFilter === "UNASSIGNED" && t.assigneeId) return false;
        if (assigneeFilter !== "UNASSIGNED" && t.assigneeId !== assigneeFilter) return false;
      }

      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
      if (typeFilter !== "ALL" && t.type !== typeFilter) return false;

      if (timeFilter !== "ALL") {
        if (timeFilter === "NO_DUE_DATE" && t.dueDate) return false;
        if (timeFilter === "TODAY") {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          if (d < startOfToday || d > endOfToday) return false;
        }
        if (timeFilter === "THIS_WEEK") {
          if (!t.dueDate) return false;
          const d = new Date(t.dueDate);
          if (d < startOfToday || d > endOfWeek) return false;
        }
        if (timeFilter === "OVERDUE") {
          if (!t.dueDate || t.status === "DONE") return false;
          const d = new Date(t.dueDate);
          if (d >= startOfToday) return false;
        }
      }

      return true;
    });

    for (const t of filtered) {
      (map[t.status] ??= []).push(t);
    }

    for (const s of STATUSES) {
      map[s.id]?.sort((a, b) => {
        let cmp = 0;
        if (sortBy === "PRIORITY") {
          cmp = (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
        } else if (sortBy === "DUE_DATE") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortBy === "CREATED_AT") {
          cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === "STORY_POINTS") {
          cmp = (b.storyPoints ?? 0) - (a.storyPoints ?? 0);
        } else if (sortBy === "TITLE") {
          cmp = a.title.localeCompare(b.title);
        } else {
          cmp = a.position - b.position;
        }
        return sortOrder === "asc" ? -cmp : cmp;
      });
    }

    return map;
  }, [data, search, sprintFilter, statusFilter, assigneeFilter, priorityFilter, timeFilter, typeFilter, sortBy, sortOrder]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (sprintFilter !== "ALL") count++;
    if (statusFilter !== "ALL") count++;
    if (assigneeFilter !== "ALL") count++;
    if (priorityFilter !== "ALL") count++;
    if (timeFilter !== "ALL") count++;
    if (typeFilter !== "ALL") count++;
    if (sortBy !== "MANUAL") count++;
    return count;
  }, [search, sprintFilter, statusFilter, assigneeFilter, priorityFilter, timeFilter, typeFilter, sortBy]);

  function resetFilters() {
    setSearch("");
    setSprintFilter("ALL");
    setStatusFilter("ALL");
    setAssigneeFilter("ALL");
    setPriorityFilter("ALL");
    setTimeFilter("ALL");
    setTypeFilter("ALL");
    setSortBy("MANUAL");
    setSortOrder("desc");
  }

  const activeSprint = useMemo(
    () => data?.sprints.find((s) => s.status === "ACTIVE") ?? null,
    [data]
  );

  function handleDragStart(event: DragStartEvent) {
    if (isViewer(data?.currentRole)) return;
    const task = data?.tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    if (isViewer(data?.currentRole)) return;
    const { active, over } = event;
    if (!over || !data) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTaskItem = data.tasks.find((t) => t.id === activeId);
    const overTaskItem = data.tasks.find((t) => t.id === overId);
    if (!activeTaskItem) return;

    const targetStatus = overTaskItem
      ? overTaskItem.status
      : STATUSES.some((s) => s.id === overId)
      ? overId
      : null;

    if (!targetStatus) return;

    if (activeTaskItem.status !== targetStatus) {
      setData((prev) => {
        if (!prev) return prev;
        const activeIndex = prev.tasks.findIndex((t) => t.id === activeId);
        const overIndex = overTaskItem
          ? prev.tasks.findIndex((t) => t.id === overId)
          : prev.tasks.length;

        const newTasks = [...prev.tasks];
        newTasks[activeIndex] = { ...newTasks[activeIndex], status: targetStatus };

        return {
          ...prev,
          tasks: arrayMove(newTasks, activeIndex, overIndex < 0 ? activeIndex : overIndex),
        };
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    if (isViewer(data?.currentRole)) return;
    const { active, over } = event;
    if (!over || !data) return;

    const taskId = String(active.id);
    const overId = String(over.id);
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overTask = data.tasks.find((t) => t.id === overId);
    const newStatus = overTask
      ? overTask.status
      : STATUSES.some((s) => s.id === overId)
      ? overId
      : null;
    if (!newStatus) return;

    let newPosition = task.position;
    if (overTask && overTask.id !== task.id) {
      const columnTasks = data.tasks
        .filter((t) => t.status === newStatus && t.id !== taskId)
        .sort((a, b) => a.position - b.position);
      const overIndex = columnTasks.findIndex((t) => t.id === overTask.id);
      if (overIndex >= 0) {
        const prevTask = columnTasks[overIndex - 1];
        const prevPos = prevTask ? prevTask.position : overTask.position - 1000;
        newPosition = (prevPos + overTask.position) / 2;
      } else {
        newPosition = overTask.position + 500;
      }
    } else if (!overTask) {
      const columnTasks = data.tasks
        .filter((t) => t.status === newStatus && t.id !== taskId)
        .sort((a, b) => a.position - b.position);
      const lastTask = columnTasks[columnTasks.length - 1];
      newPosition = lastTask ? lastTask.position + 1000 : 1000;
    }

    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t
        ),
      };
    });

    try {
      await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, position: newPosition }),
      });
    } catch (err) {
      console.error("Lỗi cập nhật task:", err);
      loadBoard();
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-xs font-semibold text-muted flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          Đang tải dữ liệu Board...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-xs text-muted">Không thể tải thông tin dự án.</div>
      </div>
    );
  }

  const isUserViewer = isViewer(data.currentRole);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Viewer Notice Banner */}
      {isUserViewer && (
        <div className="flex items-center justify-center gap-2 bg-amber-950/40 border-b border-amber-800/40 py-1.5 px-4 text-xs text-amber-200">
          <Eye className="h-3.5 w-3.5 text-amber-400" />
          <span>Bạn đang xem dự án ở chế độ <strong>Người xem (Viewer)</strong> — không thể tạo, chỉnh sửa hoặc kéo thả công việc.</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5 gap-3 bg-surface/40 backdrop-blur-md">
        {/* Breadcrumb & Live Status */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <span>Dự án</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted/60" />
            <span className="text-foreground font-bold">{data.project.name}</span>
          </div>

          {activeSprint && (
            <span className="rounded-full bg-accent/15 border border-accent/30 px-2.5 py-0.5 text-[11px] font-bold text-accent flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {activeSprint.name}
            </span>
          )}

          {data.currentRole && (
            <span className="rounded-md bg-surface-2 border border-line px-2 py-0.5 text-[10px] font-bold text-muted font-mono flex items-center gap-1">
              <Shield className="h-3 w-3 text-accent" />
              {data.currentRole}
            </span>
          )}

          <div
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              connected
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-neutral-800 text-muted"
            }`}
          >
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            <span>{connected ? "Realtime Live" : "Mất kết nối"}</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Members Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMemberOpen(true)}
            className="h-8 text-xs font-semibold border-line bg-surface hover:bg-surface-2 shadow-sm flex items-center gap-1.5"
          >
            <Users className="h-3.5 w-3.5 text-accent" />
            Thành viên ({data.members.length})
          </Button>

          {/* Notion Hub Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNotionOpen(true)}
            className="h-8 text-xs font-semibold border-neutral-700 bg-neutral-900 hover:bg-neutral-800 shadow-sm flex items-center gap-1.5 text-white"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-neutral-800 text-[10px] font-bold text-white border border-neutral-700">
              N
            </span>
            Notion Hub
          </Button>

          {/* New Task Button */}
          {canCreateTask(data.currentRole) ? (
            <Button
              size="sm"
              onClick={() => {
                setNewTaskStatus("TODO");
                setNewTaskOpen(true);
              }}
              className="h-8 text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Task mới
            </Button>
          ) : (
            <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs text-muted font-medium flex items-center gap-1 border border-line">
              <Eye className="h-3.5 w-3.5" /> Chỉ xem
            </span>
          )}
        </div>
      </div>

      {/* Filter & Sorting Control Toolbar */}
      <div className="flex items-center justify-between border-b border-line bg-surface/50 px-5 py-2.5 text-xs gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input
              ref={searchInputRef}
              placeholder="Tìm theo tên/mã task... (bấm /)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-56 pl-8 text-xs bg-surface border-line focus:border-accent"
            />
          </div>

          {/* Sprint Filter */}
          <select
            value={sprintFilter}
            onChange={(e) => setSprintFilter(e.target.value)}
            className="h-8 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer hover:border-line-strong transition-colors"
          >
            <option value="ALL">🚀 Tất cả Sprint</option>
            <option value="NONE">Chưa gán Sprint (Backlog)</option>
            {data.sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status === "ACTIVE" ? "Đang chạy" : s.status === "COMPLETED" ? "Đã xong" : "Kế hoạch"})
              </option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-8 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer hover:border-line-strong transition-colors"
          >
            <option value="ALL">👤 Tất cả nhân sự</option>
            <option value="UNASSIGNED">Chưa giao người nhận</option>
            {data.members.map((m) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name} ({m.role})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer hover:border-line-strong transition-colors"
          >
            <option value="ALL">📋 Tất cả trạng thái</option>
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer hover:border-line-strong transition-colors"
          >
            <option value="ALL">🔥 Tất cả độ ưu tiên</option>
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="h-8 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer hover:border-line-strong transition-colors"
          >
            <option value="ALL">⏰ Mọi mốc thời gian</option>
            <option value="TODAY">Hạn chót hôm nay</option>
            <option value="THIS_WEEK">Hạn chót tuần này</option>
            <option value="OVERDUE">⚠️ Đã quá hạn (Overdue)</option>
            <option value="NO_DUE_DATE">Không có hạn chót</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 rounded-lg border border-line bg-surface px-2.5 text-xs text-foreground focus:outline-none cursor-pointer hover:border-line-strong transition-colors"
          >
            <option value="ALL">🏷️ Tất cả loại</option>
            {TASK_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting & Clear Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-0.5">
            <span className="text-[11px] text-muted pl-2 font-medium">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-7 border-none bg-transparent px-2 text-xs text-foreground focus:outline-none cursor-pointer font-medium"
            >
              <option value="MANUAL">Thứ tự kéo thả</option>
              <option value="PRIORITY">Độ ưu tiên (Khẩn cấp $\rightarrow$ Thấp)</option>
              <option value="DUE_DATE">Hạn chót (Gần nhất)</option>
              <option value="CREATED_AT">Ngày tạo (Mới nhất)</option>
              <option value="STORY_POINTS">Story Points (Điểm cao)</option>
              <option value="TITLE">Tiêu đề (A-Z)</option>
            </select>

            {sortBy !== "MANUAL" && (
              <button
                onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
                className="h-7 px-2 rounded hover:bg-surface-2 text-muted hover:text-foreground cursor-pointer flex items-center gap-1 text-[11px]"
                title={sortOrder === "asc" ? "Đang tăng dần" : "Đang giảm dần"}
              >
                <ArrowUpDown className="h-3 w-3" />
                {sortOrder === "asc" ? "Tăng" : "Giảm"}
              </button>
            )}
          </div>

          {activeFilterCount > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={resetFilters}
              className="h-8 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="h-3 w-3" />
              Xóa bộ lọc ({activeFilterCount})
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board Viewport */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto p-5">
          {STATUSES.map((status) => (
            <BoardColumn
              key={status.id}
              status={status}
              tasks={tasksByStatus[status.id] ?? []}
              onAddTask={() => {
                if (isUserViewer) return;
                setNewTaskStatus(status.id);
                setNewTaskOpen(true);
              }}
              onTaskClick={(id) => setOpenTaskId(id)}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeTask ? <TaskCard task={activeTask} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Dialog */}
      {openTaskId && (
        <TaskDialog
          projectId={projectId}
          taskId={openTaskId}
          tasks={data.tasks}
          members={data.members}
          labels={data.labels}
          sprints={data.sprints}
          onClose={() => setOpenTaskId(null)}
          onChanged={loadBoard}
        />
      )}

      {/* New Task Dialog */}
      <NewTaskDialog
        projectId={projectId}
        open={newTaskOpen}
        defaultStatus={newTaskStatus}
        members={data.members}
        labels={data.labels}
        sprints={data.sprints}
        onOpenChange={setNewTaskOpen}
        onCreated={loadBoard}
      />

      {/* Notion Live Hub Dialog */}
      <NotionDialog
        projectId={projectId}
        open={notionOpen}
        onOpenChange={setNotionOpen}
        onImportSuccess={loadBoard}
      />

      {/* Member Management & RBAC Dialog */}
      <MemberDialog
        projectId={projectId}
        open={memberOpen}
        onOpenChange={setMemberOpen}
        onMembersChanged={loadBoard}
      />
    </div>
  );
}
