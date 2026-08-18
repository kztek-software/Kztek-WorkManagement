import { CheckCircle2, BookOpen, Bug, Layers } from "lucide-react";

export function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "STORY":
      return <BookOpen className="h-3.5 w-3.5 text-emerald-400" />;
    case "BUG":
      return <Bug className="h-3.5 w-3.5 text-red-400" />;
    case "EPIC":
      return <Layers className="h-3.5 w-3.5 text-purple-400" />;
    default:
      return <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />;
  }
}
