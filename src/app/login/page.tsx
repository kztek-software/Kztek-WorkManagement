"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đăng nhập thất bại");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(account: string, pass: string) {
    setEmail(account);
    setPassword(pass);
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: account, password: pass }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Không đăng nhập được tài khoản");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo & Header */}
        <div className="flex flex-col items-center gap-2.5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F05922] font-black text-white text-xl shadow-lg shadow-[#F05922]/20">
            KZ
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">KZTEK Work Management</h1>
            <p className="text-xs text-muted mt-0.5">Hệ thống điều hành & quản lý công việc nội bộ</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Tài khoản hoặc Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin hoặc email@kztek.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-xs h-9 bg-surface-2"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold">Mật khẩu</Label>
                <span className="text-[11px] text-muted">Admin: Kztek@2026</span>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-xs h-9 bg-surface-2 font-mono"
                required
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 border border-red-500/20">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-9 text-xs font-bold" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng nhập hệ thống"}
            </Button>
          </form>

          {/* Quick Login Section */}
          <div className="space-y-2 pt-2 border-t border-line">
            <div className="text-[11px] font-medium text-muted text-center">Đăng nhập nhanh 1-Click:</div>

            {/* Default Admin Button */}
            <button
              type="button"
              onClick={() => quickLogin("admin", "Kztek@2026")}
              disabled={loading}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-orange-500/30 bg-orange-950/20 hover:bg-orange-950/40 text-orange-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-400" />
                <span>Admin Mặc Định (admin / Kztek@2026)</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {/* Demo Members */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("alice@demo.dev", "demo123")}
                disabled={loading}
                className="h-7 text-[11px] border-line hover:bg-surface-2"
              >
                Alice (PM)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("binh@demo.dev", "demo123")}
                disabled={loading}
                className="h-7 text-[11px] border-line hover:bg-surface-2"
              >
                Bình (Dev)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => quickLogin("chi@demo.dev", "demo123")}
                disabled={loading}
                className="h-7 text-[11px] border-line hover:bg-surface-2"
              >
                Chi (Dev)
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
}
