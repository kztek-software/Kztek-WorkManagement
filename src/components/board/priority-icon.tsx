import { Flame, ArrowUp, Equal, ArrowDown } from "lucide-react";

export function PriorityIcon({ priority }: { priority: string }) {
  switch (priority) {
    case "URGENT":
      return <Flame className="h-3.5 w-3.5 text-red-400" />;
    case "HIGH":
      return <ArrowUp className="h-3.5 w-3.5 text-orange-400" />;
    case "MEDIUM":
      return <Equal className="h-3.5 w-3.5 text-yellow-400" />;
    case "LOW":
      return <ArrowDown className="h-3.5 w-3.5 text-slate-400" />;
    default:
      return null;
  }
}
