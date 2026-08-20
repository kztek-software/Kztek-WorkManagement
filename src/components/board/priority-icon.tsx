import { Flame, ArrowUp, Equal, ArrowDown } from "lucide-react";

const PRIORITY_ICONS = {
  URGENT: Flame,
  HIGH: ArrowUp,
  MEDIUM: Equal,
  LOW: ArrowDown,
} as const;

const PRIORITY_DEFAULT_COLOR: Record<string, string> = {
  URGENT: "text-accent",
  HIGH: "text-orange-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-slate-400",
};

export function PriorityIcon({ priority, className }: { priority: string; className?: string }) {
  const Icon = PRIORITY_ICONS[priority as keyof typeof PRIORITY_ICONS];
  if (!Icon) return null;
  // Pass className to fully control size/color (e.g. inside a colored pill);
  // otherwise fall back to the original standalone size + semantic color.
  return <Icon className={className ?? `h-3.5 w-3.5 ${PRIORITY_DEFAULT_COLOR[priority]}`} />;
}
