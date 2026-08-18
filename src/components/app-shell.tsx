"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  KanbanSquare,
  BarChart3,
  Rocket,
  LogOut,
  Plus,
  ChevronDown,
  ArrowRightLeft,
  Users,
  Check,
  FolderKanban,
  Settings,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
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

  const mainNav = [
    { href: `/projects/${project.id}/board`, label: "Board Công Việc", icon: KanbanSquare },
    { href: `/projects/${project.id}/sprints`, label: "Sprints & Kế Hoạch", icon: Rocket },
    { href: `/projects/${project.id}/reports`, label: "Báo Cáo & KPI", icon: BarChart3 },
  ];

  const systemNav = [
    { href: `/projects/${project.id}/notion`, label: "Tích Hợp Notion", icon: ArrowRightLeft },
    { href: `/projects/${project.id}/users`, label: "Người Dùng & Email", icon: Users },
  ];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Modern Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-surface/90 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F05922] to-[#FF8C00] font-black text-white text-xs shadow-md shadow-[#F05922]/25">
              KZ
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold tracking-tight block leading-tight text-white">
                KZTEK Work
              </span>
              <span className="text-[10px] text-muted block font-medium">Enterprise Management</span>
            </div>
          </div>

          <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" title="Hệ thống trực tuyến" />
        </div>

        {/* Project Switcher Card */}
        <div className="relative p-3 border-b border-line/60">
          <button
            onClick={() => setProjectMenuOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-xl border border-line bg-surface-2/60 p-2.5 text-left hover:border-line-strong hover:bg-surface-2 transition-all cursor-pointer shadow-sm group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent font-mono font-bold text-xs">
                {project.key.slice(0, 3)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-foreground group-hover:text-accent transition-colors">
                  {project.name}
                </div>
                <div className="text-[10px] text-muted font-mono">Key: {project.key}</div>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${projectMenuOpen ? "rotate-180 text-foreground" : ""}`} />
          </button>

          {projectMenuOpen && (
            <div className="absolute left-3 right-3 top-[calc(100%+4px)] z-50 rounded-xl border border-line bg-surface-3/95 p-1.5 shadow-2xl backdrop-blur-xl animate-fade-in-up">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                Dự án hiện có ({projects.length})
              </div>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}/board`}
                    onClick={() => setProjectMenuOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                      p.id === project.id
                        ? "bg-accent/20 text-accent font-semibold"
                        : "text-foreground hover:bg-surface-2"
                    )}
                  >
                    <span className="truncate">{p.name}</span>
                    {p.id === project.id && <Check className="h-3.5 w-3.5 shrink-0 text-accent" />}
                  </Link>
                ))}
              </div>

              <Link
                href="/welcome"
                onClick={() => setProjectMenuOpen(false)}
                className="mt-1 flex items-center gap-1.5 rounded-lg border-t border-line px-2.5 py-2 text-xs font-semibold text-accent hover:bg-accent/10 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Tạo dự án mới
              </Link>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Main Workspace Section */}
          <div className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted">
              Quản lý dự án
            </div>
            {mainNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all group",
                    active
                      ? "bg-accent text-white shadow-md shadow-accent/25"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active ? "text-white" : "text-muted group-hover:text-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* System & Integrations Section */}
          <div className="space-y-1">
            <div className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-muted">
              Hệ thống & Tích hợp
            </div>
            {systemNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all group",
                    active
                      ? "bg-accent text-white shadow-md shadow-accent/25"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active ? "text-white" : "text-muted group-hover:text-foreground")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Project Members List */}
          <div className="pt-2 border-t border-line/60">
            <div className="flex items-center justify-between px-2.5 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Thành viên ({project.members.length})
              </span>
              <span className="text-[10px] text-accent font-medium">{project.key}</span>
            </div>
            <div className="space-y-1">
              {project.members.slice(0, 5).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 hover:bg-surface-2/60 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6 shrink-0 border border-white/10">
                      <AvatarFallback color={m.user.avatarColor} className="text-[9px] font-bold">
                        {initials(m.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-foreground">{m.user.name}</div>
                      <div className="truncate text-[9px] text-muted">{m.user.title || m.role}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-surface-2 text-muted border border-line">
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Footer */}
        <div className="border-t border-line p-3 bg-surface/95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 shrink-0 border border-white/15 shadow-sm">
                <AvatarFallback color={user.avatarColor} className="font-bold text-xs">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-foreground flex items-center gap-1">
                  {user.name}
                  {user.role === "ADMIN" && (
                    <span className="rounded bg-accent/20 px-1 py-0.1 text-[8px] font-black text-accent">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="truncate text-[10px] text-muted font-mono">{user.email}</div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <NotificationBell projectId={project.id} />
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 text-muted hover:text-red-400 hover:bg-red-950/20 cursor-pointer transition-colors"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main App Content Viewport */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {children}
      </main>
    </div>
  );
}
