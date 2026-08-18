"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Plus } from "lucide-react";
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Chào mừng đến FlowBoard</h1>
        <p className="text-sm text-muted">Tạo project đầu tiên để bắt đầu</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo project mới</DialogTitle>
            <DialogDescription>Project là nơi chứa board, sprint và báo cáo của team</DialogDescription>
          </DialogHeader>
          <form onSubmit={createProject} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pname">Tên project</Label>
              <Input
                id="pname"
                placeholder="VD: Website bán hàng"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pkey">Key (viết tắt, in hoa)</Label>
              <Input
                id="pkey"
                placeholder="VD: WEB"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                required
                minLength={2}
                maxLength={6}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pdesc">Mô tả (tuỳ chọn)</Label>
              <Input
                id="pdesc"
                placeholder="Mô tả ngắn về project"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {error && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              <Plus className="h-4 w-4" />
              {loading ? "Đang tạo..." : "Tạo project"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
