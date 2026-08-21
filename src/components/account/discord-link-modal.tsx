"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Bot, Check, RefreshCw, Unlink, ShieldOff, ExternalLink } from "lucide-react";

interface DiscordLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DiscordStatus = {
  linked: boolean;
  username?: string | null;
  linkedAt?: string | null;
  integrationEnabled: boolean;
  authorizeUrl?: string | null;
};

/**
 * Modal tự liên kết Discord cá nhân — user bấm "Kết nối Discord", được điều hướng sang Discord
 * xác thực (OAuth2 identify), quay lại tự động gắn discordUserId vào tài khoản đang đăng nhập.
 */
export function DiscordLinkModal({ isOpen, onClose }: DiscordLinkModalProps) {
  const [status, setStatus] = useState<DiscordStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchStatus() {
    setLoading(true);
    setError("");
    try {
      const returnTo = window.location.pathname;
      const res = await fetch(`/api/account/discord?returnTo=${encodeURIComponent(returnTo)}`);
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
      } else {
        setError(data.error || "Không thể tải trạng thái liên kết Discord");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    if (!confirm("Hủy liên kết Discord hiện tại? Bạn sẽ không nhận thông báo qua Discord cho đến khi liên kết lại.")) return;
    await fetch("/api/account/discord", { method: "DELETE" });
    fetchStatus();
  }

  return (
    <Dialog
      header="Kết Nối Discord Cá Nhân"
      visible={isOpen}
      onHide={onClose}
      onShow={fetchStatus}
      className="w-full max-w-md border border-line bg-surface rounded-2xl shadow-2xl"
    >
      <div className="space-y-4 pt-2 text-sm">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted gap-2 text-xs">
            <RefreshCw className="h-4 w-4 animate-spin" /> Đang tải trạng thái...
          </div>
        ) : !status?.integrationEnabled ? (
          <div className="rounded-xl border border-dashed border-line bg-surface-2/60 p-4 text-xs text-muted text-center">
            Hệ thống chưa bật tích hợp Discord. Vui lòng liên hệ Quản trị viên.
          </div>
        ) : status?.linked ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-emerald-700">
                  Đã liên kết Discord{status.username ? `: ${status.username}` : ""}
                </div>
                <div className="text-muted mt-0.5">
                  Bạn sẽ nhận DM thông báo giao việc / bình luận qua Bot Discord của KZTEK (nếu cùng server với Bot).
                </div>
              </div>
            </div>
            <Button
              onClick={handleUnlink}
              outlined
              severity="danger"
              className="w-full text-xs font-semibold gap-1.5 h-9"
            >
              <Unlink className="h-3.5 w-3.5 mr-1.5" /> Hủy liên kết
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-muted leading-relaxed">
              Bấm nút bên dưới để đăng nhập Discord và xác thực liên kết tài khoản. Lưu ý: bạn cần
              tham gia server Discord của KZTEK trước thì Bot mới gửi được tin nhắn riêng (DM) cho bạn.
            </p>

            {status?.authorizeUrl ? (
              <a
                href={status.authorizeUrl}
                className="flex items-center justify-center gap-2 rounded-xl bg-accent hover:bg-accent/90 text-white text-xs font-bold h-9 px-4 transition-colors"
              >
                <Bot className="h-3.5 w-3.5" /> Kết Nối Discord <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <div className="text-[11px] text-muted italic text-center">
                Hệ thống chưa cấu hình đủ Client ID Discord — liên hệ Quản trị viên.
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-accent-subtle border border-accent/25 p-2.5 text-[11px] text-accent font-semibold flex items-center gap-1.5">
            <ShieldOff className="h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}
      </div>
    </Dialog>
  );
}
