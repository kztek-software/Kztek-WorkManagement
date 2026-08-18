"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
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
  LifeBuoy,
  Shield,
  Clock,
  UserCheck,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog } from "primereact/dialog";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { PROJECT_STATUSES, projectStatusMeta } from "@/lib/constants";
import type { UserLite } from "@/lib/types";

type ProjectInfo = {
  id: string;
  name: string;
  key: string;
  status?: string;
  members: { id: string; role: string; user: UserLite & { team?: { name: string; color: string } | null } }[];
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

type TeamData = {
  id: string;
  name: string;
  code: string;
  color: string;
  members: { id: string; name: string; email: string; avatarColor: string; title: string | null }[];
};

type UserData = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  title: string | null;
  teamId: string | null;
  team?: { id: string; name: string; code: string; color: string } | null;
};

export function AppShell({
  user,
  project,
  projects,
  children,
}: {
  user: UserLite;
  project: ProjectInfo;
  projects: { id: string; name: string; key: string; status?: string }[];
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
  const [newProjectStatus, setNewProjectStatus] = useState<string>("PLANNING");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState("");

  // Teams & Users Data for creation
  const [availableTeams, setAvailableTeams] = useState<TeamData[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [loadingModalData, setLoadingModalData] = useState(false);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load teams and users when create modal is opened
  useEffect(() => {
    if (createProjectOpen && availableTeams.length === 0) {
      setLoadingModalData(true);
      Promise.all([
        fetch("/api/teams").then((r) => r.json()),
        fetch("/api/users").then((r) => r.json()),
      ])
        .then(([teamsData, usersData]) => {
          if (teamsData.teams) setAvailableTeams(teamsData.teams);
          if (usersData.users) setAvailableUsers(usersData.users);
        })
        .catch(() => {})
        .finally(() => setLoadingModalData(false));
    }
  }, [createProjectOpen, availableTeams.length]);

  const mainNav = [
    { href: `/projects/${project.id}/dashboard`, label: "Dashboard Dự Án", icon: LayoutDashboard },
    { href: `/projects/${project.id}/board`, label: "Board Công Việc", icon: KanbanSquare },
    { href: `/projects/${project.id}/tickets`, label: "Hộp Thư Ticket KH", icon: LifeBuoy },
    { href: `/projects/${project.id}/sprints`, label: "Sprints & Kế Hoạch", icon: Rocket },
    { href: `/projects/${project.id}/reports`, label: "Báo Cáo & KPI", icon: BarChart3 },
  ];

  const systemNav = [
    { href: `/projects/${project.id}/all-projects`, label: "Tất Cả Dự Án", icon: FolderKanban, adminOnly: true },
    { href: `/projects/${project.id}/notion`, label: "Tích Hợp Notion", icon: ArrowRightLeft },
    { href: `/projects/${project.id}/users`, label: "Người Dùng & Email", icon: Users, adminOnly: true },
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

  // Handle Team selection with auto-selecting members
  function toggleTeam(teamId: string) {
    const isSelected = selectedTeamIds.includes(teamId);
    const team = availableTeams.find((t) => t.id === teamId);
    const teamMemberIds = team ? team.members.map((m) => m.id) : [];

    if (isSelected) {
      // Bỏ chọn team -> bỏ chọn teamId và các thành viên của team đó (nếu không thuộc team khác đã chọn)
      setSelectedTeamIds((prev) => prev.filter((id) => id !== teamId));
      setSelectedMemberIds((prev) => {
        const remainingTeams = availableTeams.filter((t) => selectedTeamIds.includes(t.id) && t.id !== teamId);
        const otherSelectedUserIds = new Set(remainingTeams.flatMap((t) => t.members.map((m) => m.id)));
        return prev.filter((uid) => otherSelectedUserIds.has(uid) || !teamMemberIds.includes(uid));
      });
    } else {
      // Chọn team -> thêm teamId và auto-select toàn bộ thành viên của team đó
      setSelectedTeamIds((prev) => [...prev, teamId]);
      setSelectedMemberIds((prev) => {
        const newSet = new Set([...prev, ...teamMemberIds]);
        return Array.from(newSet);
      });
    }
  }

  // Toggle individual member
  function toggleMember(userId: string) {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
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
          status: newProjectStatus,
          teamIds: selectedTeamIds,
          memberIds: selectedMemberIds,
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
      setNewProjectStatus("PLANNING");
      setSelectedTeamIds([]);
      setSelectedMemberIds([]);
      setProjectMenuOpen(false);

      // Redirect directly to the new project dashboard
      router.push(`/projects/${data.project.id}/dashboard`);
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

  const activeProjectStatusMeta = projectStatusMeta(project.status);

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
        {/* PROJECT SWITCHER WIDGET WITH STATUS BADGE                                */}
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
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {/* Vibrant Project Key Avatar */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono font-bold text-xs text-white shadow-md bg-gradient-to-br",
                  getProjectGradient(project.key)
                )}
              >
                {project.key.slice(0, 3)}
              </div>

              {/* Project Title, Key & Status */}
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-foreground group-hover:text-white transition-colors">
                  {project.name}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold"
                    style={{
                      backgroundColor: activeProjectStatusMeta.bg,
                      color: activeProjectStatusMeta.color,
                      border: `1px solid ${activeProjectStatusMeta.border}`,
                    }}
                  >
                    {activeProjectStatusMeta.label}
                  </span>
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
                <span>Dự án của bạn ({projects.length})</span>
                <span className="rounded bg-surface-2 px-1.5 py-0.2 text-[9px] font-mono text-muted-light">
                  ESC
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
                  const pStatusMeta = projectStatusMeta(p.status);
                  return (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}/dashboard`}
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
                          <div className="flex items-center gap-1.5 text-[10px] text-muted font-mono mt-0.5">
                            <span>{p.key}</span>
                            <span>•</span>
                            <span
                              className="px-1 py-0.1 rounded text-[8px] font-semibold"
                              style={{ color: pStatusMeta.color }}
                            >
                              {pStatusMeta.label}
                            </span>
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
              const active = pathname === item.href || (item.href.endsWith("/dashboard") && pathname === `/projects/${project.id}`);
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
                      <div className="truncate text-[9px] text-muted">
                        {m.user.team ? m.user.team.name : (m.user.title || m.role)}
                      </div>
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

        {/* Sidebar Status Footer */}
        <div className="border-t border-line/60 p-3 bg-surface/40 flex items-center justify-between text-[11px] text-muted">
          <div className="flex items-center gap-2 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <span className="text-foreground/80 font-semibold">KZTEK Work</span>
          </div>
          <span className="font-mono text-[10px] text-muted/70 bg-surface-2 px-1.5 py-0.5 rounded border border-line">
            v2.4
          </span>
        </div>
      </aside>

      {/* Main App Content Viewport with Global Top-Right Header */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {/* Global Top-Right Navigation Bar */}
        <header className="h-14 shrink-0 border-b border-line bg-surface/70 backdrop-blur-md px-5 flex items-center justify-between z-20">
          {/* Left Context & Project Info */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Link
              href={`/projects/${project.id}/dashboard`}
              className="text-muted hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <FolderKanban className="h-3.5 w-3.5 text-accent" />
              <span>{project.name}</span>
            </Link>
            <span className="text-muted/40">/</span>
            <span className="text-foreground font-bold">
              {pathname.endsWith("/board") && "Board Công Việc"}
              {pathname.endsWith("/sprints") && "Sprints & Kế Hoạch"}
              {pathname.endsWith("/reports") && "Báo Cáo & KPI"}
              {pathname.endsWith("/tickets") && "Tickets Khách Hàng"}
              {pathname.endsWith("/notion") && "Tích Hợp Notion Hub"}
              {pathname.endsWith("/users") && "Người Dùng & Phân Quyền"}
              {pathname.endsWith("/settings") && "Cài Đặt Dự Án"}
              {(pathname.endsWith("/dashboard") || pathname === `/projects/${project.id}`) && "Tổng Quan Dự Án"}
            </span>
          </div>

          {/* Right Top-Bar: Notifications & User Account Profile Card */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell projectId={project.id} currentUserEmail={user.email} />

            <div className="h-4 w-[1px] bg-line/80" />

            {/* Top-Right User Profile Widget */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border py-1.5 px-2.5 transition-all cursor-pointer shadow-sm group",
                  userMenuOpen
                    ? "bg-surface-3 border-accent ring-2 ring-accent/30 shadow-md"
                    : "bg-surface-2/80 border-line hover:border-line-strong hover:bg-surface-3"
                )}
              >
                <Avatar className="h-7 w-7 shrink-0 border border-white/15 shadow-sm">
                  <AvatarFallback color={user.avatarColor} className="font-bold text-[11px] text-white">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 text-left hidden sm:block">
                  <div className="truncate text-xs font-bold text-foreground group-hover:text-white flex items-center gap-1.5">
                    <span>{user.name}</span>
                    {user.role === "ADMIN" ? (
                      <span className="px-1.5 py-0.1 rounded text-[8px] font-black bg-accent/20 text-accent border border-accent/30 font-mono">
                        ADMIN
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.1 rounded text-[8px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/25 font-mono">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[10px] text-muted font-mono">{user.email}</div>
                </div>

                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-muted transition-transform ml-0.5 group-hover:text-foreground",
                    userMenuOpen && "rotate-180 text-accent"
                  )}
                />
              </button>

              {/* User Profile Flyout Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-72 rounded-2xl border border-white/15 bg-[#131826] p-3 shadow-2xl backdrop-blur-2xl animate-fade-in-up ring-1 ring-black/50 space-y-3">
                  {/* User Info Header Card */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-2/80 border border-line">
                    <Avatar className="h-10 w-10 shrink-0 border border-white/20 shadow-md">
                      <AvatarFallback color={user.avatarColor} className="font-bold text-sm text-white">
                        {initials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-foreground truncate">{user.name}</div>
                      <div className="text-[11px] text-muted font-mono truncate">{user.email}</div>
                      {user.title && (
                        <div className="text-[10px] text-accent font-semibold truncate mt-0.5">{user.title}</div>
                      )}
                    </div>
                  </div>

                  {/* Quick Navigation Links */}
                  <div className="space-y-1">
                    <Link
                      href={`/projects/${project.id}/users`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors"
                    >
                      <Users className="h-4 w-4 text-accent" />
                      <span>Quản trị Cơ cấu & Phân quyền</span>
                    </Link>

                    <Link
                      href={`/projects/${project.id}/settings`}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors"
                    >
                      <Settings className="h-4 w-4 text-blue-400" />
                      <span>Cài đặt Dự án & Cấu hình</span>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="border-t border-line/60 pt-2">
                    <button
                      type="button"
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất khỏi hệ thống</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: TẠO DỰ ÁN MỚI — HỖ TRỢ CHỌN TEAM AUTO-SELECT THÀNH VIÊN VÀ STATUS */}
      {/* ========================================================================= */}
      <Dialog
        header="Khởi Tạo Dự Án Mới"
        visible={createProjectOpen}
        onHide={() => setCreateProjectOpen(false)}
        className="w-full max-w-2xl border border-line bg-surface rounded-2xl shadow-2xl"
      >
        <form onSubmit={handleCreateProject} className="space-y-4 pt-2 max-h-[80vh] overflow-y-auto pr-1">
          {createProjectError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400 font-medium">
              {createProjectError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                <span className="text-[10px] font-mono text-muted">VD: KZ, PARK</span>
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
          </div>

          {/* Trạng thái dự án ban đầu */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Trạng thái khởi tạo dự án</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {PROJECT_STATUSES.map((st) => {
                const isSelected = newProjectStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setNewProjectStatus(st.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer",
                      isSelected
                        ? "bg-surface-3 shadow-sm ring-2 ring-accent"
                        : "bg-surface-2/60 border-line hover:bg-surface-2"
                    )}
                    style={{
                      borderColor: isSelected ? st.color : undefined,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: st.color }}>
                      {st.label}
                    </span>
                  </button>
                );
              })}
            </div>
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

          {/* ========================================================================= */}
          {/* CHỌN TEAM / PHÒNG BAN THAM GIA -> TỰ ĐỘNG CHỌN THÀNH VIÊN                 */}
          {/* ========================================================================= */}
          <div className="space-y-2.5 rounded-xl border border-line bg-surface-2/40 p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                <span className="text-xs font-bold text-foreground">
                  Chọn phòng ban / Team tham gia dự án
                </span>
              </div>
              <span className="text-[10px] text-muted">
                (Tự động chọn toàn bộ nhân sự của team)
              </span>
            </div>

            {loadingModalData ? (
              <div className="flex items-center justify-center py-4 text-xs text-muted">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Đang tải danh sách phòng ban...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableTeams.map((team) => {
                  const isChecked = selectedTeamIds.includes(team.id);
                  return (
                    <button
                      type="button"
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className={cn(
                        "flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                        isChecked
                          ? "bg-accent/15 border-accent shadow-sm"
                          : "bg-surface border-line hover:border-line-strong hover:bg-surface-2"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate text-foreground">
                            {team.name}
                          </div>
                          <div className="text-[10px] text-muted">
                            {team.members.length} thành viên ({team.code})
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors",
                          isChecked
                            ? "bg-accent border-accent text-white"
                            : "border-line bg-surface-2 text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Danh sách thành viên được auto-select */}
            <div className="pt-2 border-t border-line/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Nhân sự tham gia dự án ({selectedMemberIds.length + 1} người)
                </span>
                <span className="text-[10px] text-muted italic">
                  * Bạn ({user.name}) tự động là Chủ dự án (Owner)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1 bg-surface rounded-xl border border-line">
                {availableUsers.map((u) => {
                  const isChecked = selectedMemberIds.includes(u.id) || u.id === user.id;
                  const isCreator = u.id === user.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => !isCreator && toggleMember(u.id)}
                      className={cn(
                        "flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors select-none",
                        isCreator
                          ? "bg-accent/15 border border-accent/30 cursor-default"
                          : isChecked
                          ? "bg-surface-2 hover:bg-surface-3 cursor-pointer border border-line"
                          : "opacity-60 hover:opacity-100 hover:bg-surface-2 cursor-pointer border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar className="h-5 w-5 text-[9px] shrink-0">
                          <AvatarFallback color={u.avatarColor}>
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-[11px] text-foreground flex items-center gap-1">
                            {u.name}
                            {isCreator && (
                              <span className="text-[8px] font-bold text-accent bg-accent/20 px-1 rounded">
                                Owner
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className={cn(
                          "h-4 w-4 rounded flex items-center justify-center shrink-0 text-[10px]",
                          isChecked ? "text-emerald-400" : "text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
              className="font-bold bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25 px-4"
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
