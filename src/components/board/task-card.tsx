import { memo } from "react";
import { Calendar, MessageSquare, CheckSquare, AlertTriangle, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import type { TaskDto, MemberDto } from "@/lib/types";
import { priorityMeta, typeMeta } from "@/lib/constants";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { PriorityIcon } from "./priority-icon";
import { TypeIcon } from "./type-icon";

function TaskCardComponent({
  task,
  overlay,
  members,
  onAssign,
}: {
  task: TaskDto;
  overlay?: boolean;
  members?: MemberDto[];
  onAssign?: (taskId: string, userId: string | null) => void;
}) {
  const priority = priorityMeta(task.priority);
  const type = typeMeta(task.type);
  const subtasks = task.subtasks ?? [];
  const labels = task.labels ?? [];
  const doneSubtasks = subtasks.filter((s) => s.done).length;
  const isOverdue = task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date();
  const subtaskProgress = subtasks.length > 0 ? (doneSubtasks / subtasks.length) * 100 : 0;
  const isTicket = task.title.startsWith("[TK-");

  // The avatar/assignee slot doubles as a quick-assign trigger when members + onAssign are wired in.
  const assigneeSlot = task.assignee ? (
    <Avatar className="h-[22px] w-[22px] border border-white/10 shadow-sm shrink-0" title={`Phụ trách: ${task.assignee.name}`}>
      <AvatarFallback color={task.assignee.avatarColor} className="text-[9px] font-bold">
        {initials(task.assignee.name)}
      </AvatarFallback>
    </Avatar>
  ) : (
    <div
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-dashed border-line-strong text-muted/70"
      title="Chưa giao"
    >
      <Plus className="h-3 w-3" />
    </div>
  );

  return (
    <div
      className={`group relative rounded-xl border p-3 sm:p-3.5 overflow-hidden transition-all duration-200 ${
        overlay
          ? "rotate-2 scale-[1.03] shadow-2xl shadow-black/80 ring-2 ring-accent border-accent bg-surface/95 backdrop-blur-xl cursor-grabbing z-50"
          : "border-line bg-surface/80 hover:bg-surface hover:border-line-strong hover:shadow-lg shadow-sm cursor-grab active:cursor-grabbing active:scale-[0.98]"
      }`}
    >
      {/* Priority strip — the single strong color cue on the card */}
      <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: priority.color }} />

      {/* Drag affordance — purely visual, the whole card stays draggable */}
      <div className="pointer-events-none absolute left-2.5 top-2.5 flex gap-0.5 opacity-0 group-hover:opacity-40 transition-opacity">
        <span className="h-[3px] w-[3px] rounded-full bg-muted" />
        <span className="h-[3px] w-[3px] rounded-full bg-muted" />
        <span className="h-[3px] w-[3px] rounded-full bg-muted" />
      </div>

      {/* Top row: Type + code & Priority (soft tint, matches the label/ticket badge language) */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <TypeIcon type={task.type} />
          <span className="truncate text-[10.5px] font-bold text-muted">
            #{task.number} · {type.label}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {task.storyPoints != null && (
            <span className="rounded-md bg-surface-2 border border-line px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted">
              {task.storyPoints} pts
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap"
            style={{ backgroundColor: `${priority.color}18`, color: priority.color, border: `1px solid ${priority.color}40` }}
          >
            <PriorityIcon priority={task.priority} className="h-2.5 w-2.5" />
            {priority.label}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="mb-2.5 text-[13px] font-semibold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
        {task.title}
      </h3>

      {/* Labels (+ ticket badge folded in, saves a whole row) */}
      {(isTicket || labels.length > 0) && (
        <div className="mb-2.5 flex flex-wrap gap-1">
          {isTicket && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-accent/20 text-accent border border-accent/30">
              Ticket KH
            </span>
          )}
          {labels.slice(0, 3).map(({ label }) => (
            <span
              key={label.id}
              className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-tight"
              style={{ backgroundColor: `${label.color}20`, color: label.color, border: `1px solid ${label.color}40` }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer: due date, comments, checklist chips + assignee */}
      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-line/50">
        <div className="flex flex-wrap items-center gap-1">
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold ${
                isOverdue
                  ? "bg-accent-subtle text-accent border border-accent/30 font-bold"
                  : "bg-surface-2 text-muted border border-line"
              }`}
            >
              {isOverdue ? <AlertTriangle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
              {isOverdue ? "Quá hạn " : ""}
              {format(new Date(task.dueDate), "dd/MM")}
            </span>
          )}

          {task._count.comments > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 border border-line px-1.5 py-0.5 text-[10.5px] font-semibold text-muted">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}

          {subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 border border-line px-1.5 py-0.5 text-[10.5px] font-semibold text-muted">
              <CheckSquare className="h-3 w-3" />
              {doneSubtasks}/{subtasks.length}
            </span>
          )}
        </div>

        {members && onAssign ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="rounded-full shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
                title={task.assignee ? `Phụ trách: ${task.assignee.name} — bấm để đổi` : "Bấm để gán người phụ trách"}
              >
                {assigneeSlot}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onAssign(task.id, null)}>
                <span className="h-4 w-4 flex items-center justify-center">
                  {!task.assigneeId && <Check className="h-3 w-3" />}
                </span>
                Chưa giao
              </DropdownMenuItem>
              {members.map((m) => (
                <DropdownMenuItem key={m.user.id} onClick={() => onAssign(task.id, m.user.id)}>
                  <span className="h-4 w-4 flex items-center justify-center shrink-0">
                    {task.assigneeId === m.user.id && <Check className="h-3 w-3" />}
                  </span>
                  <Avatar className="h-4 w-4 shrink-0">
                    <AvatarFallback color={m.user.avatarColor} className="text-[7px] font-bold">
                      {initials(m.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{m.user.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          assigneeSlot
        )}
      </div>

      {/* Ambient checklist progress rail along the bottom edge */}
      {subtasks.length > 0 && (
        <div className="absolute left-0 right-0 bottom-0 h-[2.5px] bg-surface-2">
          <div
            className={`h-full transition-all duration-300 ${subtaskProgress === 100 ? "bg-emerald-500" : "bg-accent"}`}
            style={{ width: `${subtaskProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export const TaskCard = memo(TaskCardComponent, (prev, next) => {
  return (
    prev.overlay === next.overlay &&
    prev.task.id === next.task.id &&
    prev.task.title === next.task.title &&
    prev.task.status === next.task.status &&
    prev.task.priority === next.task.priority &&
    prev.task.position === next.task.position &&
    prev.task.dueDate === next.task.dueDate &&
    prev.task.storyPoints === next.task.storyPoints &&
    prev.task.assigneeId === next.task.assigneeId &&
    prev.task._count?.comments === next.task._count?.comments &&
    prev.task.subtasks?.length === next.task.subtasks?.length &&
    prev.task.labels?.length === next.task.labels?.length &&
    prev.members === next.members &&
    prev.onAssign === next.onAssign
  );
});
