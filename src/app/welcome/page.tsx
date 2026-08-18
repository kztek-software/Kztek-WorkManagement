"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft, KanbanSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function WelcomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingProjects, setExistingProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    // Kiểm tra xem đã có project nào chưa
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.projects && data.projects.length > 0) {
          setExistingProjects(data.projects);
        }
      })
      .catch(() => {});
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, key: key.toUpperCase(), description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Không tạo được project");
        return;
      }
      router.push(`/projects/${data.project.id}/board`);
      router.refresh();
    } catch {
      setError("Lỗi kết nối");
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
        <p className="text-xs text-muted">Quản lý công việc và dự án thông minh</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Tạo project mới</DialogTitle>
            <DialogDescription className="text-xs">
              Project là nơi chứa board, sprint và báo cáo công việc của team
            </DialogDescription>
          </DialogHeader>

          {/* If existing projects found, show direct return button */}
          {existingProjects.length > 0 && (
            <div className="rounded-xl border border-line bg-surface-2 p-3 space-y-2 text-xs">
              <div className="text-muted font-medium text-[11px]">Hệ thống đã có dự án sẵn có:</div>
              <div className="flex flex-wrap gap-2">
                {existingProjects.map((p) => (
                  <Button
                    key={p.id}
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/projects/${p.id}/board`)}
                    className="h-8 text-xs font-semibold flex items-center gap-1.5 border-accent/40 text-accent hover:bg-accent/10"
                  >
                    <KanbanSquare className="h-3.5 w-3.5" />
                    Mở: {p.name} →
                  </Button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={createProject} className="space-y-3.5 pt-1">
            <div className="space-y-1">
              <Label htmlFor="pname" className="text-xs">Tên project *</Label>
              <Input
                id="pname"
                placeholder="VD: Hệ Thống Bãi Xe Thông Minh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xs h-9"
                required
                minLength={2}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="pkey" className="text-xs">Key dự án (viết tắt in hoa, VD: KZ, PARK) *</Label>
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

            <div className="space-y-1">
              <Label htmlFor="pdesc" className="text-xs">Mô tả (tuỳ chọn)</Label>
              <Input
                id="pdesc"
                placeholder="Mô tả ngắn về dự án"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400 border border-red-500/20">{error}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              {existingProjects.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/projects/${existingProjects[0].id}/board`)}
                  className="text-xs text-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Quay lại Board
                </Button>
              ) : <div />}

              <Button type="submit" size="sm" disabled={loading} className="text-xs font-semibold">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                Tạo project mới
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
