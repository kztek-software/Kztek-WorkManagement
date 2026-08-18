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
  ChevronsUpDown,
  ArrowRightLeft,
  Users,
  Check,
  FolderKanban,
  Settings,
  Sparkles,
  Search,
  Building2,
  FolderPlus,
  Loader2,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "primereact/dialog";
import { NotificationBell } from "@/components/notifications/notification-bell";
import type { UserLite } from "@/lib/types";

type ProjectInfo = {
  id: string;
  name: string;
  key: string;
  members: { id: string; role: string; user: UserLite }[];
};

const PROJECT_GRADIENTS = [
  "from-orange-500 to-amber-600",
  "from-blue-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-600 to-pink-600",
  "from-rose-500 to-red-600",
  "from-cyan-500 to-blue-600",
];

function getProjectGradient(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PROJECT_GRADIENTS.length;
  return PROJECT_GRADIENTS[index];
}

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
  const [searchProject, setSearchProject] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create Project Modal State
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectKey, setNewProjectKey] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState("");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
    }
    if (projectMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [projectMenuOpen]);

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

  // Auto-generate project key from name
  function handleNameChange(val: string) {
    setNewProjectName(val);
    if (!newProjectKey || newProjectKey.length <= 4) {
      const words = val.trim().split(/\s+/);
      const generated = words
        .map((w) => w[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 4);
      if (generated) setNewProjectKey(generated);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    setCreateProjectError("");
    setCreatingProject(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          key: newProjectKey.trim().toUpperCase(),
          description: newProjectDesc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateProjectError(data.error || "Không tạo được dự án");
        return;
      }

      setCreateProjectOpen(false);
      setNewProjectName("");
      setNewProjectKey("");
      setNewProjectDesc("");
      setProjectMenuOpen(false);

      // Redirect directly to the new project board
      router.push(`/projects/${data.project.id}/board`);
      router.refresh();
    } catch {
      setCreateProjectError("Lỗi kết nối máy chủ");
    } finally {
      setCreatingProject(false);
    }
  }

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchProject.toLowerCase()) ||
      p.key.toLowerCase().includes(searchProject.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Modern Obsidian Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-line bg-surface/95 backdrop-blur-md z-30">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-line px-4 bg-surface/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F05922] via-[#FF6B35] to-[#FFA500] font-black text-white text-sm shadow-lg shadow-[#F05922]/30 ring-1 ring-white/20">
              KZ
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold tracking-tight block leading-tight text-white">
                KZTEK Work
              </span>
              <span className="text-[10px] text-muted block font-medium">Enterprise Management</span>
            </div>
          </div>

          <div
            className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/60 ring-2 ring-emerald-500/20 animate-pulse"
            title="Máy chủ trực tuyến"
          />
        </div>

        {/* ========================================================================= */}
        {/* REDESIGNED PROJECT SWITCHER WIDGET                                        */}
        {/* ========================================================================= */}
        <div className="relative p-3 border-b border-line/70 bg-surface/50" ref={dropdownRef}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted/80 mb-1.5 px-1 flex items-center justify-between">
            <span>Dự án hiện tại</span>
            <span className="text-[9px] font-mono text-accent font-semibold">{project.key}</span>
          </div>

          <button
            onClick={() => setProjectMenuOpen((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border p-2.5 text-left transition-all cursor-pointer shadow-sm group",
              projectMenuOpen
                ? "bg-surface-3 border-accent ring-2 ring-accent/30 shadow-md"
                : "bg-surface-2/80 border-line hover:border-line-strong hover:bg-surface-3"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Vibrant Project Key Avatar */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono font-bold text-xs text-white shadow-md bg-gradient-to-br",
                  getProjectGradient(project.key)
                )}
              >
                {project.key.slice(0, 3)}
              </div>

              {/* Project Title & Key */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-foreground group-hover:text-white transition-colors">
                  {project.name}
                </div>
                <div className="text-[10px] text-muted font-mono flex items-center gap-1">
                  <span>Mã:</span>
                  <span className="font-semibold text-foreground/80">{project.key}</span>
                </div>
              </div>
            </div>

            <div className="h-6 w-6 rounded-lg bg-surface flex items-center justify-center border border-line/60 group-hover:border-line-strong transition-colors shrink-0 ml-1.5">
              <ChevronsUpDown
                className={cn(
                  "h-3.5 w-3.5 text-muted transition-colors group-hover:text-foreground",
                  projectMenuOpen && "text-accent"
                )}
              />
            </div>
          </button>

          {/* Flyout Workspace Menu Dropdown */}
          {projectMenuOpen && (
            <div className="absolute left-3 right-3 top-[calc(100%+6px)] z-50 rounded-2xl border border-white/15 bg-[#131826] p-2 shadow-2xl backdrop-blur-2xl animate-fade-in-up ring-1 ring-black/50">
              {/* Header */}
              <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted flex items-center justify-between border-b border-line/50 pb-2">
                <span>Chuyển đổi dự án ({projects.length})</span>
                <span className="rounded bg-surface-2 px-1.5 py-0.2 text-[9px] font-mono text-muted-light">
                  ESC để đóng
                </span>
              </div>

              {/* Search Box if > 2 projects */}
              {projects.length > 2 && (
                <div className="relative my-2 px-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted" />
                  <input
                    type="text"
                    placeholder="Tìm tên hoặc mã dự án..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full h-7.5 rounded-lg border border-line bg-surface-2 pl-8 pr-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                    autoFocus
                  />
                </div>
              )}

              {/* Projects List */}
              <div className="space-y-1 max-h-56 overflow-y-auto py-1 pr-0.5">
                {filteredProjects.map((p) => {
                  const isActive = p.id === project.id;
                  return (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}/board`}
                      onClick={() => setProjectMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-2.5 py-2 transition-all group/item",
                        isActive
                          ? "bg-accent/15 border border-accent/40 shadow-sm"
                          : "hover:bg-surface-2/90 border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Project Initial Avatar */}
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono font-bold text-[11px] text-white shadow-sm bg-gradient-to-br",
                            getProjectGradient(p.key)
                          )}
                        >
                          {p.key.slice(0, 3)}
                        </div>

                        <div className="min-w-0">
                          <div
                            className={cn(
                              "truncate text-xs font-bold transition-colors",
                              isActive
                                ? "text-accent"
                                : "text-foreground group-hover/item:text-white"
                            )}
                          >
                            {p.name}
                          </div>
                          <div className="text-[10px] text-muted font-mono">
                            Mã: <span className="text-muted-light font-semibold">{p.key}</span>
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white shrink-0 shadow-sm">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </Link>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <div className="p-3 text-center text-xs text-muted">
                    Không tìm thấy dự án phù hợp
                  </div>
                )}
              </div>

              {/* Quick Action: Create New Project */}
              <div className="border-t border-line/60 pt-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProjectMenuOpen(false);
                    setCreateProjectOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-bold text-accent hover:bg-accent/15 hover:text-accent-hover transition-all cursor-pointer"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-accent/20 text-accent">
                    <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  </div>
                  <span>Tạo dự án mới</span>
                </button>
              </div>
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
                      ? "bg-accent text-white shadow-md shadow-accent/25 font-bold"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      active ? "text-white" : "text-muted group-hover:text-foreground"
                    )}
                  />
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
                      ? "bg-accent text-white shadow-md shadow-accent/25 font-bold"
                      : "text-muted hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      active ? "text-white" : "text-muted group-hover:text-foreground"
                    )}
                  />
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
              <span className="text-[10px] text-accent font-mono font-bold">{project.key}</span>
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

      {/* ========================================================================= */}
      {/* MODAL: TẠO DỰ ÁN MỚI TRỰC TIẾP (IN-APP CREATE PROJECT DIALOG)            */}
      {/* ========================================================================= */}
      <Dialog
        header="Khởi Tạo Dự Án Mới"
        visible={createProjectOpen}
        onHide={() => setCreateProjectOpen(false)}
        className="w-full max-w-md border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
          {createProjectError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400 font-medium">
              {createProjectError}
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tên dự án *</Label>
            <Input
              placeholder="VD: Hệ Thống Bãi Xe Thông Minh KZ-2026"
              value={newProjectName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-xs h-9 bg-surface-2"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Mã dự án (Key: 2-6 ký tự in hoa) *</Label>
              <span className="text-[10px] font-mono text-muted">VD: KZ, PARK, HW</span>
            </div>
            <Input
              placeholder="VD: KZ"
              value={newProjectKey}
              onChange={(e) => setNewProjectKey(e.target.value.toUpperCase())}
              className="text-xs h-9 bg-surface-2 font-mono uppercase"
              required
              minLength={2}
              maxLength={6}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Mô tả mục tiêu dự án (Tùy chọn)</Label>
            <Textarea
              placeholder="Mô tả phạm vi, kế hoạch triển khai của dự án..."
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              rows={2}
              className="text-xs bg-surface-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-line">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateProjectOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={creatingProject}
              className="font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25"
            >
              {creatingProject ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Plus className="h-3.5 w-3.5 mr-1 stroke-[2.5]" />
              )}
              Tạo dự án ngay
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
