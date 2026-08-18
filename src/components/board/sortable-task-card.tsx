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
    transition,
    opacity: isDragging ? 0.3 : 1,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only trigger click if not actively dragging
        if (!isDragging) {
          onClick();
        }
      }}
      className="cursor-grab active:cursor-grabbing select-none"
    >
      <TaskCard task={task} />
    </div>
  );
}
