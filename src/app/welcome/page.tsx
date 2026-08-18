"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft, LayoutDashboard, KanbanSquare, Loader2, Building2, UserCheck, Check, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PROJECT_STATUSES } from "@/lib/constants";

type TeamData = {
  id: string;
  name: string;
  code: string;
  color: string;
  members: { id: string; name: string; email: string; avatarColor: string }[];
};

type UserData = {
  id: string;
  name: string;
  email: string;
  avatarColor: string;
  teamId: string | null;
};

export default function WelcomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("PLANNING");
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [availableTeams, setAvailableTeams] = useState<TeamData[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserData[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingProjects, setExistingProjects] = useState<{ id: string; name: string; key: string; status?: string }[]>([]);

  useEffect(() => {
    // Tải danh sách project của user
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && data.projects.length > 0) {
          setExistingProjects(data.projects);
        }
      })
      .catch(() => {});

    // Tải teams và users
    Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ])
      .then(([teamsData, usersData]) => {
        if (teamsData.teams) setAvailableTeams(teamsData.teams);
        if (usersData.users) setAvailableUsers(usersData.users);
      })
      .catch(() => {});
  }, []);

  function handleNameChange(val: string) {
    setName(val);
    if (!key || key.length <= 4) {
      const words = val.trim().split(/\s+/);
      const generated = words
        .map((w) => w[0]?.toUpperCase() || "")
        .join("")
        .slice(0, 4);
      if (generated) setKey(generated);
    }
  }

  function toggleTeam(teamId: string) {
    const isSelected = selectedTeamIds.includes(teamId);
    const team = availableTeams.find((t) => t.id === teamId);
    const teamMemberIds = team ? team.members.map((m) => m.id) : [];

    if (isSelected) {
      setSelectedTeamIds((prev) => prev.filter((id) => id !== teamId));
      setSelectedMemberIds((prev) => {
        const remainingTeams = availableTeams.filter((t) => selectedTeamIds.includes(t.id) && t.id !== teamId);
        const otherSelectedUserIds = new Set(remainingTeams.flatMap((t) => t.members.map((m) => m.id)));
        return prev.filter((uid) => otherSelectedUserIds.has(uid) || !teamMemberIds.includes(uid));
      });
    } else {
      setSelectedTeamIds((prev) => [...prev, teamId]);
      setSelectedMemberIds((prev) => {
        const newSet = new Set([...prev, ...teamMemberIds]);
        return Array.from(newSet);
      });
    }
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          key: key.toUpperCase(),
          description,
          status,
          teamIds: selectedTeamIds,
          memberIds: selectedMemberIds,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tạo được project");
        return;
      }
      router.push(`/projects/${data.project.id}/dashboard`);
      router.refresh();
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F05922] font-black text-white text-xl shadow-lg shadow-[#F05922]/20">
          KZ
        </div>
        <h1 className="text-xl font-bold">KZTEK Work Management</h1>
        <p className="text-xs text-muted">Hệ thống điều phối dự án & công việc thông minh</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Tạo Dự Án Mới</DialogTitle>
            <DialogDescription className="text-xs">
              Dự án là không gian làm việc tập trung gồm Dashboard, Kanban Board, Sprint và Báo cáo KPI
            </DialogDescription>
          </DialogHeader>

          {/* If existing projects found, show direct return button */}
          {existingProjects.length > 0 && (
            <div className="rounded-xl border border-line bg-surface-2 p-3 space-y-2 text-xs">
              <div className="text-muted font-medium text-[11px]">Dự án bạn đã tham gia:</div>
              <div className="flex flex-wrap gap-2">
                {existingProjects.map((p) => (
                  <Button
                    key={p.id}
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/projects/${p.id}/dashboard`)}
                    className="h-8 text-xs font-semibold flex items-center gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Mở: {p.name} ({p.key}) →
                  </Button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={createProject} className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="pname" className="text-xs font-semibold">Tên dự án *</Label>
                <Input
                  id="pname"
                  placeholder="VD: Hệ Thống Bãi Xe Thông Minh"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="text-xs h-9"
                  required
                  minLength={2}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pkey" className="text-xs font-semibold">Key dự án (2-6 ký tự in hoa) *</Label>
                <Input
                  id="pkey"
                  placeholder="VD: KZ"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  className="text-xs h-9 font-mono uppercase"
                  required
                  minLength={2}
                  maxLength={6}
                />
              </div>
            </div>

            {/* Trạng thái */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Trạng thái khởi tạo dự án</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {PROJECT_STATUSES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id)}
                    className={`py-1.5 px-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                      status === st.id ? "bg-surface-3 ring-2 ring-accent" : "bg-surface-2/60 border-line"
                    }`}
                    style={{ borderColor: status === st.id ? st.color : undefined }}
                  >
                    <span style={{ color: st.color }}>{st.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="pdesc" className="text-xs font-semibold">Mô tả mục tiêu (Tùy chọn)</Label>
              <Textarea
                id="pdesc"
                placeholder="Mô tả ngắn gọn về dự án..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="text-xs bg-surface-2"
              />
            </div>

            {/* Chọn Team */}
            {availableTeams.length > 0 && (
              <div className="rounded-xl border border-line bg-surface-2/40 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-accent" />
                    Chọn phòng ban / Team tham gia
                  </span>
                  <span className="text-[10px] text-muted">(Auto chọn nhân sự)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {availableTeams.map((t) => {
                    const isChecked = selectedTeamIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => toggleTeam(t.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                          isChecked ? "bg-accent/15 border-accent text-accent font-bold" : "bg-surface border-line hover:bg-surface-2"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                          <span className="truncate">{t.name}</span>
                        </div>
                        {isChecked && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                {selectedMemberIds.length > 0 && (
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                    <UserCheck className="h-3.5 w-3.5" />
                    Đã tự động chọn {selectedMemberIds.length} nhân sự tham gia dự án
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400 border border-red-500/20">{error}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              {existingProjects.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/projects/${existingProjects[0].id}/dashboard`)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Quay lại Dashboard
                </Button>
              ) : <div />}

              <Button type="submit" size="sm" disabled={loading} className="text-xs font-bold bg-accent hover:bg-accent/90 text-white shadow-md">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                Tạo dự án ngay
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
