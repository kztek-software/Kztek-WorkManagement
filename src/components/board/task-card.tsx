"use client";

import { Calendar, MessageSquare, CheckSquare, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import type { TaskDto } from "@/lib/types";
import { priorityMeta, typeMeta } from "@/lib/constants";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { PriorityIcon } from "./priority-icon";
import { TypeIcon } from "./type-icon";

export function TaskCard({ task, overlay }: { task: TaskDto; overlay?: boolean }) {
  const priority = priorityMeta(task.priority);
  const type = typeMeta(task.type);
  const doneSubtasks = task.subtasks.filter((s) => s.done).length;
  const isOverdue = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();
  const subtaskProgress = task.subtasks.length > 0 ? (doneSubtasks / task.subtasks.length) * 100 : 0;

  return (
    <div
      className={`group rounded-xl border p-3.5 transition-all duration-200 ${
        overlay
          ? "rotate-2 scale-[1.03] shadow-2xl shadow-black/80 ring-2 ring-accent border-accent bg-surface/95 backdrop-blur-xl cursor-grabbing z-50"
          : "border-line bg-surface/80 hover:bg-surface hover:border-line-strong hover:shadow-lg shadow-sm cursor-grab active:cursor-grabbing"
      }`}
    >
      {/* Top row: Type, Code & Priority */}
      <div className="mb-2 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5">
          <TypeIcon type={task.type} />
          <span className="text-[10px] font-bold font-mono text-muted tracking-tight">
            #{task.number}
          </span>
          {task.title.startsWith("[TK-") && (
            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-accent/20 text-accent border border-accent/30">
              Ticket KH
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {task.storyPoints != null && (
            <span className="rounded-md bg-surface-2 border border-line px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted">
              {task.storyPoints} pts
            </span>
          )}
          <PriorityIcon priority={task.priority} />
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2.5 text-xs font-semibold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
        {task.title}
      </h3>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map(({ label }) => (
            <span
              key={label.id}
              className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-tight"
              style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Subtasks mini-progress bar */}
      {task.subtasks.length > 0 && (
        <div className="mb-2.5 space-y-1">
          <div className="flex items-center justify-between text-[9px] font-medium text-muted">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-2.5 w-2.5" />
              Checklist
            </span>
            <span>
              {doneSubtasks}/{task.subtasks.length} ({Math.round(subtaskProgress)}%)
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-surface-2 overflow-hidden border border-line">
            <div
              className={`h-full transition-all duration-300 ${
                subtaskProgress === 100 ? "bg-emerald-500" : "bg-accent"
              }`}
              style={{ width: `${subtaskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Date, Comments & Assignee */}
      <div className="flex items-center justify-between pt-1 border-t border-line/50">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                isOverdue
                  ? "bg-red-500/15 text-red-400 border border-red-500/30"
                  : "bg-surface-2 text-muted"
              }`}
            >
              {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              {format(new Date(task.dueDate), "dd/MM")}
            </span>
          )}

          {task._count.comments > 0 && (
            <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}
        </div>

        {task.assignee ? (
          <div className="flex items-center gap-1.5" title={`Phụ trách: ${task.assignee.name}`}>
            <Avatar className="h-5 w-5 border border-white/10 shadow-sm">
              <AvatarFallback color={task.assignee.avatarColor} className="text-[8px] font-bold">
                {initials(task.assignee.name)}
              </AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <span className="text-[9px] text-muted/60 italic">Chưa giao</span>
        )}
      </div>
    </div>
  );
}
