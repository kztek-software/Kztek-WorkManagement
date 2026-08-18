"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap,
  KanbanSquare,
  BarChart3,
  Rocket,
  LogOut,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { UserLite } from "@/lib/types";

type ProjectInfo = {
  id: string;
  name: string;
  key: string;
  members: { id: string; role: string; user: UserLite }[];
};

export function AppShell({
  user,
  project,
  projects,
  children,
}: {
  user: UserLite;
  project: ProjectInfo;
  projects: { id: string; name: string; key: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const nav = [
    { href: `/projects/${project.id}/board`, label: "Board", icon: KanbanSquare },
    { href: `/projects/${project.id}/sprints`, label: "Sprints", icon: Rocket },
    { href: `/projects/${project.id}/reports`, label: "Báo cáo", icon: BarChart3 },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent font-bold text-white text-xs shadow-sm">
            KZ
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold tracking-tight block">KZTEK Work</span>
          </div>
        </div>

        {/* Project switcher */}
        <div className="relative border-b border-line p-3">
          <button
            onClick={() => setProjectMenuOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left hover:bg-surface-2 cursor-pointer"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{project.name}</div>
              <div className="text-xs text-muted">Key: {project.key}</div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
          </button>
          {projectMenuOpen && (
            <div className="absolute left-3 right-3 top-full z-40 mt-1 rounded-lg border border-line bg-surface-2 p-1 shadow-xl animate-fade-in-up">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}/board`}
                  onClick={() => setProjectMenuOpen(false)}
                  className={cn(
                    "block rounded-md px-2 py-1.5 text-sm hover:bg-line",
                    p.id === project.id && "bg-line"
                  )}
                >
                  {p.name}
                </Link>
              ))}
              <Link
                href="/welcome"
                onClick={() => setProjectMenuOpen(false)}
                className="mt-1 flex items-center gap-1.5 rounded-md border-t border-line px-2 py-1.5 text-sm text-muted hover:bg-line"
              >
                <Plus className="h-3.5 w-3.5" /> Project mới
              </Link>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Members */}
        <div className="border-t border-line p-3">
          <div className="mb-2 px-1 text-xs font-medium text-muted">
            Thành viên ({project.members.length})
          </div>
          <div className="space-y-1">
            {project.members.slice(0, 5).map((m) => (
              <div key={m.id} className="flex items-center gap-2 rounded-md px-1 py-1">
                <Avatar>
                  <AvatarFallback color={m.user.avatarColor}>
                    {initials(m.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{m.user.name}</div>
                  {m.user.title && (
                    <div className="truncate text-[10px] text-muted">{m.user.title}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User footer */}
        <div className="flex items-center justify-between border-t border-line p-3">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback color={user.avatarColor}>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">{user.name}</div>
              <div className="truncate text-[10px] text-muted">{user.email}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Đăng xuất">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
