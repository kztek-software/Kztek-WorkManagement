"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskDto } from "@/lib/types";
import { TaskCard } from "./task-card";

export function SortableTaskCard({
  task,
  onClick,
}: {
  task: TaskDto;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: transition || "transform 220ms cubic-bezier(0.2, 0, 0, 1), opacity 150ms ease",
    touchAction: "none",
    willChange: transform ? "transform, opacity" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) onClick();
      }}
      className={`cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging
          ? "opacity-30 scale-[0.98] border-2 border-dashed border-accent/60 rounded-xl bg-accent/10"
          : "hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <TaskCard task={task} />
    </div>
  );
}
