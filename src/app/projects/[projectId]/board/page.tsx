"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
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
  rectIntersection,
  type DragStartEvent,
  type DragEndEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus, Search, Wifi, WifiOff, Sparkles, Filter, Users, Shield, Eye } from "lucide-react";
import { STATUSES, PRIORITIES } from "@/lib/constants";
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

export default function BoardPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;

  const [data, setData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [activeTask, setActiveTask] = useState<TaskDto | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState("TODO");
  const [notionOpen, setNotionOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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

  // Keyboard shortcuts (C for new task, / for search, N for notion)
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

  // SSE realtime
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
        // Refetch khi có thay đổi từ người khác
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
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
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

  const tasksByStatus = useMemo(() => {
    const map: Record<string, TaskDto[]> = {};
    for (const s of STATUSES) map[s.id] = [];
    if (!data) return map;
    const q = search.trim().toLowerCase();
    for (const t of data.tasks) {
      if (q && !t.title.toLowerCase().includes(q) && !`${data.project.key}-${t.number}`.toLowerCase().includes(q)) continue;
      if (priorityFilter !== "ALL" && t.priority !== priorityFilter) continue;
      if (assigneeFilter !== "ALL" && (t.assigneeId ?? "unassigned") !== assigneeFilter) continue;
      (map[t.status] ??= []).push(t);
    }
    for (const s of STATUSES) {
      map[s.id]?.sort((a, b) => a.position - b.position);
    }
    return map;
  }, [data, search, priorityFilter, assigneeFilter]);

  const activeSprint = useMemo(
    () => data?.sprints.find((s) => s.status === "ACTIVE") ?? null,
    [data]
  );

  function handleDragStart(event: DragStartEvent) {
    if (isViewer(data?.currentRole)) return;
    const task = data?.tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
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

    // over có thể là 1 task khác hoặc 1 column id
    const overTask = data.tasks.find((t) => t.id === overId);
    const newStatus = overTask
      ? overTask.status
      : STATUSES.some((s) => s.id === overId)
      ? overId
      : null;
    if (!newStatus) return;

    // Tính position mới
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

    // Optimistic update
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
        <div className="text-sm text-muted">Đang tải board...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-sm text-muted">Không tải được dữ liệu board</div>
      </div>
    );
  }

  const isUserViewer = isViewer(data.currentRole);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Viewer Notice Banner */}
      {isUserViewer && (
        <div className="flex items-center justify-center gap-2 bg-slate-900 border-b border-slate-800 py-1.5 px-4 text-xs text-slate-300">
          <Eye className="h-3.5 w-3.5 text-accent" />
          <span>Bạn đang xem dự án ở chế độ <strong>Người xem (Viewer)</strong> — không thể thêm, sửa hoặc kéo thả task.</span>
        </div>
      )}

      {/* Topbar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4 gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold">Board</h1>
          {activeSprint && (
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
              {activeSprint.name}
            </span>
          )}
          {data.currentRole && (
            <span className="rounded-full bg-surface-2 border border-line px-2.5 py-0.5 text-[11px] font-medium text-foreground flex items-center gap-1.5">
              <Shield className="h-3 w-3 text-accent" />
              {data.currentRole}
            </span>
          )}
          <span
            className={`flex items-center gap-1.5 text-xs ${connected ? "text-emerald-400" : "text-muted"}`}
          >
            {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {connected ? "Realtime" : "Mất kết nối"}
          </span>
        </div>

        {/* Filters & Search & Actions */}
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 rounded-lg border border-line bg-surface px-2 text-xs text-foreground focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả ưu tiên</option>
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <Input
              ref={searchInputRef}
              placeholder="Tìm task... (bấm /)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-44 pl-8 text-xs"
            />
          </div>

          {/* Members & Roles Management Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMemberOpen(true)}
            className="h-8 text-xs font-medium border-line hover:bg-surface-2 flex items-center gap-1.5"
            title="Quản lý thành viên & phân quyền"
          >
            <Users className="h-3.5 w-3.5 text-accent" />
            Thành viên ({data.members.length})
          </Button>

          {/* Notion Hub Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setNotionOpen(true)}
            className="h-8 text-xs font-medium border-neutral-700 hover:bg-neutral-800 flex items-center gap-1.5"
            title="Kiểm tra & liên kết trực tiếp Notion (Phím N)"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-neutral-900 text-[10px] font-bold text-white border border-neutral-700">
              N
            </span>
            Notion Hub
          </Button>

          {/* New Task Button (Hidden for Viewers) */}
          {canCreateTask(data.currentRole) ? (
            <Button
              size="sm"
              onClick={() => {
                setNewTaskStatus("TODO");
                setNewTaskOpen(true);
              }}
              className="h-8 text-xs"
              title="Tạo task mới (Phím C)"
            >
              <Plus className="h-3.5 w-3.5" /> Task mới
            </Button>
          ) : (
            <span className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs text-muted font-medium flex items-center gap-1 border border-line">
              <Eye className="h-3.5 w-3.5" /> Chỉ xem
            </span>
          )}
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-3 overflow-x-auto p-4">
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

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Task detail dialog */}
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

      {/* New task dialog */}
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
