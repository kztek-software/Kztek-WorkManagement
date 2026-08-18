"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus, ListTodo } from "lucide-react";
import type { TaskDto } from "@/lib/types";
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
    <div className="flex w-80 shrink-0 flex-col rounded-2xl border border-line bg-surface/40 p-2.5 backdrop-blur-sm shadow-sm transition-all">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: status.color, boxShadow: `0 0 8px ${status.color}80` }}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {status.label}
          </span>
          <span className="rounded-full bg-surface-2 border border-line px-2 py-0.5 text-[10px] font-bold text-muted">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {points > 0 && (
            <span className="rounded-md bg-surface-2/80 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-muted border border-line">
              {points} pts
            </span>
          )}
          <button
            onClick={onAddTask}
            className="h-6 w-6 rounded-lg flex items-center justify-center text-muted hover:bg-surface-2 hover:text-foreground cursor-pointer transition-colors"
            title="Thêm task mới vào cột này"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task List / Drop Zone */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-2.5 overflow-y-auto p-1 rounded-xl transition-all duration-200 ${
            isOver
              ? "bg-accent/10 ring-2 ring-accent/60 border-2 border-dashed border-accent/60 scale-[1.01]"
              : ""
          }`}
          style={{ minHeight: 280 }}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}

          {tasks.length === 0 && (
            <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-dashed border-line/80 p-4 text-center text-xs text-muted/60 space-y-1">
              <ListTodo className="h-6 w-6 text-muted/40 mb-1" />
              <span className="font-semibold text-muted text-xs">Chưa có công việc</span>
              <span className="text-[10px]">Kéo thả thẻ vào đây hoặc bấm + để tạo mới</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
