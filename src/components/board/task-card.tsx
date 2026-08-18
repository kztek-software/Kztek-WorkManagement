"use client";

import { Calendar, MessageSquare, CheckSquare } from "lucide-react";
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

  return (
    <div
      className={`rounded-xl border bg-surface p-3 transition-all duration-150 ${
        overlay
          ? "rotate-2 scale-[1.04] shadow-2xl shadow-black/80 ring-2 ring-accent/80 border-accent/60 bg-surface/95 backdrop-blur-md cursor-grabbing z-50"
          : "border-line hover:border-line-strong hover:bg-surface-2/60 shadow-sm"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TypeIcon type={task.type} />
          <span className="text-[10px] font-medium text-muted">FB-{task.number}</span>
        </div>
        <PriorityIcon priority={task.priority} />
      </div>

      <p className="mb-2 text-sm font-medium leading-snug">{task.title}</p>

      {task.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map(({ label }) => (
            <span
              key={label.id}
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: `${label.color}22`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-muted">
          {task.storyPoints != null && (
            <span className="rounded bg-surface px-1.5 py-0.5 font-semibold">{task.storyPoints}</span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-0.5 ${isOverdue ? "text-red-400" : ""}`}>
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), "dd/MM")}
            </span>
          )}
          {task.subtasks.length > 0 && (
            <span className="flex items-center gap-0.5">
              <CheckSquare className="h-3 w-3" />
              {doneSubtasks}/{task.subtasks.length}
            </span>
          )}
          {task._count.comments > 0 && (
            <span className="flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}
        </div>
        {task.assignee && (
          <Avatar className="h-5 w-5">
            <AvatarFallback color={task.assignee.avatarColor} className="text-[8px]">
              {initials(task.assignee.name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
