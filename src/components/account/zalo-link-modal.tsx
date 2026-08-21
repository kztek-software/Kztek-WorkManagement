"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { MessageCircle, Copy, Check, RefreshCw, Unlink, ShieldOff } from "lucide-react";

interface ZaloLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ZaloStatus = {
  linked: boolean;
  linkedAt?: string | null;
  phone?: string | null;
  integrationEnabled: boolean;
  oaId?: string | null;
};

/**
 * Modal tự liên kết Zalo cá nhân — user quét/theo dõi OA của KZTEK rồi gửi mã 6 số hiện ở đây
 * vào khung chat OA để hệ thống tự động gắn zaloUserId vào tài khoản đang đăng nhập.
 */
export function ZaloLinkModal({ isOpen, onClose }: ZaloLinkModalProps) {
  const [status, setStatus] = useState<ZaloStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function fetchStatus() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/zalo");
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
      } else {
        setError(data.error || "Không thể tải trạng thái liên kết Zalo");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateCode() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/account/zalo", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setCode(data.code);
        setExpiresAt(data.expiresAt);
      } else {
        setError(data.error || "Không thể sinh mã liên kết");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setGenerating(false);
    }
  }

  async function handleUnlink() {
    if (!confirm("Hủy liên kết Zalo hiện tại? Bạn sẽ không nhận thông báo qua Zalo cho đến khi liên kết lại.")) return;
    await fetch("/api/account/zalo", { method: "DELETE" });
    fetchStatus();
  }

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog
      header="Kết Nối Zalo Cá Nhân"
      visible={isOpen}
      onHide={onClose}
      onShow={() => {
        setCode(null);
        fetchStatus();
      }}
      className="w-full max-w-md border border-line bg-surface rounded-2xl shadow-2xl"
    >
      <div className="space-y-4 pt-2 text-sm">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted gap-2 text-xs">
            <RefreshCw className="h-4 w-4 animate-spin" /> Đang tải trạng thái...
          </div>
        ) : !status?.integrationEnabled ? (
          <div className="rounded-xl border border-dashed border-line bg-surface-2/60 p-4 text-xs text-muted text-center">
            Hệ thống chưa bật tích hợp Zalo. Vui lòng liên hệ Quản trị viên.
          </div>
        ) : status?.linked ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Check className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-emerald-700">Đã liên kết Zalo thành công</div>
                <div className="text-muted mt-0.5">
                  Bạn sẽ nhận thông báo giao việc / bình luận qua Zalo OA của KZTEK.
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
              Làm theo 3 bước sau để nhận thông báo công việc qua Zalo (miễn phí):
            </p>
            <ol className="text-xs space-y-2 text-foreground list-decimal pl-4">
              <li>
                Quét mã QR hoặc theo dõi (follow) Official Account <strong>KZTEK</strong> trên Zalo
                {status?.oaId && (
                  <>
                    {" "}
                    (OA ID: <span className="font-mono text-accent">{status.oaId}</span>)
                  </>
                )}
                .
              </li>
              <li>Bấm nút bên dưới để sinh mã liên kết 6 số.</li>
              <li>Gửi đúng mã đó vào khung chat với OA KZTEK trên Zalo.</li>
            </ol>

            {!code ? (
              <Button
                onClick={handleGenerateCode}
                disabled={generating}
                className="w-full text-xs font-bold gap-1.5 h-9 bg-accent border-accent hover:bg-accent/90"
              >
                {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <MessageCircle className="h-3.5 w-3.5 mr-1.5" />}
                Sinh Mã Liên Kết
              </Button>
            ) : (
              <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-center space-y-2">
                <div className="text-[11px] text-muted font-semibold">Mã liên kết của bạn:</div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black font-mono text-accent tracking-widest">{code}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-accent/10 text-accent cursor-pointer"
                    title="Sao chép mã"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-[10px] text-muted">
                  Hết hạn lúc {expiresAt ? new Date(expiresAt).toLocaleTimeString("vi-VN") : "—"} — gửi mã này vào chat Zalo với OA KZTEK.
                </div>
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
