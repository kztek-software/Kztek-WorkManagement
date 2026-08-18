"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { TaskDto } from "@/lib/types";
import { TaskCard } from "./task-card";
import { SortableTaskCard } from "./sortable-task-card";

type Status = { id: string; label: string; color: string };

export function BoardColumn({
  status,
  tasks,
  onAddTask,
  onTaskClick,
}: {
  status: Status;
  tasks: TaskDto[];
  onAddTask: () => void;
  onTaskClick: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });
  const points = tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-surface/60">
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: status.color }} />
          <span className="text-xs font-semibold uppercase tracking-wide">{status.label}</span>
          <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {points > 0 && <span className="text-[10px] text-muted">{points} pts</span>}
          <button
            onClick={onAddTask}
            className="rounded p-1 text-muted hover:bg-surface-2 hover:text-foreground cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-2 overflow-y-auto px-2 pb-2 transition-colors rounded-lg ${
            isOver ? "bg-accent/10 ring-1 ring-accent/30" : ""
          }`}
          style={{ minHeight: 200 }}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}
          {tasks.length === 0 && (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">
              Thả task vào đây
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
