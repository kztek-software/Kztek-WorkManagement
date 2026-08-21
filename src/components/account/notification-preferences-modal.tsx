"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Mail, MessageCircle, Bell, RefreshCw, Save, CheckCircle2, Info, Bot } from "lucide-react";

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PreferenceData = {
  emailOnAssign: boolean;
  emailOnStatusChange: boolean;
  emailOnComment: boolean;
  emailOnMention: boolean;
  zaloOnAssign: boolean;
  zaloOnStatusChange: boolean;
  zaloOnComment: boolean;
  zaloOnMention: boolean;
  inAppOnAssign: boolean;
  inAppOnStatusChange: boolean;
  inAppOnComment: boolean;
  inAppOnMention: boolean;
  discordOnAssign: boolean;
  discordOnStatusChange: boolean;
  discordOnComment: boolean;
  discordOnMention: boolean;
};

type SystemDefaults = {
  email: {
    notifyOnAssign: boolean;
    notifyOnStatusChange: boolean;
    notifyOnComment: boolean;
  };
  zaloEnabled: boolean;
  zalo: {
    notifyOnAssign: boolean;
    notifyOnStatusChange: boolean;
    notifyOnComment: boolean;
  };
  discordEnabled: boolean;
  discord: {
    notifyOnAssign: boolean;
    notifyOnStatusChange: boolean;
    notifyOnComment: boolean;
  };
};

const EVENT_ROWS: { key: "Assign" | "StatusChange" | "Comment" | "Mention"; label: string; systemKey: "notifyOnAssign" | "notifyOnStatusChange" | "notifyOnComment" | null }[] = [
  { key: "Assign", label: "Giao việc mới", systemKey: "notifyOnAssign" },
  { key: "StatusChange", label: "Đổi trạng thái công việc", systemKey: "notifyOnStatusChange" },
  { key: "Comment", label: "Bình luận mới", systemKey: "notifyOnComment" },
  { key: "Mention", label: "Được nhắc đến (@mention)", systemKey: "notifyOnComment" }, // dùng chung công tắc tổng "Bình luận"
];

/**
 * Modal cho user tự chọn kênh nhận thông báo mong muốn (Email / Zalo / Trong ứng dụng) cho từng loại sự kiện.
 * Đây là lớp lọc cá nhân — Admin vẫn có công tắc tổng ở Cài đặt Hệ thống, nếu Admin đã tắt 1 kênh
 * cho 1 loại sự kiện thì tùy chọn cá nhân ở đây cũng không có tác dụng cho kênh đó (được làm mờ + ghi rõ).
 */
export function NotificationPreferencesModal({ isOpen, onClose }: NotificationPreferencesModalProps) {
  const [pref, setPref] = useState<PreferenceData | null>(null);
  const [systemDefaults, setSystemDefaults] = useState<SystemDefaults | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function fetchPreferences() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/notification-preferences");
      const data = await res.json();
      if (res.ok) {
        setPref(data.preference);
        setSystemDefaults(data.systemDefaults);
      } else {
        setError(data.error || "Không thể tải tùy chọn thông báo");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  }

  function toggle(field: keyof PreferenceData) {
    if (!pref) return;
    setPref({ ...pref, [field]: !pref[field] });
  }

  async function handleSave() {
    if (!pref) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/account/notification-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pref),
      });
      const data = await res.json();
      if (res.ok) {
        setPref(data.preference);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(data.error || "Không thể lưu tùy chọn");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  }

  function isSystemDisabled(channel: "email" | "zalo" | "discord", systemKey: "notifyOnAssign" | "notifyOnStatusChange" | "notifyOnComment" | null): boolean {
    if (!systemDefaults || !systemKey) return false;
    if (channel === "email") return !systemDefaults.email[systemKey];
    if (channel === "zalo") return !systemDefaults.zaloEnabled || !systemDefaults.zalo[systemKey];
    if (channel === "discord") return !systemDefaults.discordEnabled || !systemDefaults.discord[systemKey];
    return false;
  }

  return (
    <Dialog
      header="Tùy Chọn Kênh Nhận Thông Báo"
      visible={isOpen}
      onHide={onClose}
      onShow={fetchPreferences}
      className="w-full max-w-2xl border border-line bg-surface rounded-2xl shadow-2xl"
    >
      <div className="space-y-4 pt-2">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted gap-2 text-xs">
            <RefreshCw className="h-4 w-4 animate-spin" /> Đang tải tùy chọn...
          </div>
        ) : pref && systemDefaults ? (
          <>
            <p className="text-xs text-muted leading-relaxed">
              Chọn kênh bạn muốn nhận cho từng loại thông báo. Ô mờ nghĩa là Quản trị viên đã tắt kênh đó ở cấp hệ thống — bạn không thể tự bật lại.
            </p>

            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-2/70 text-left">
                    <th className="px-3 py-2.5 font-bold text-foreground">Loại thông báo</th>
                    <th className="px-3 py-2.5 font-bold text-foreground text-center w-24">
                      <span className="flex items-center justify-center gap-1"><Bell className="h-3.5 w-3.5 text-accent" /> Trong App</span>
                    </th>
                    <th className="px-3 py-2.5 font-bold text-foreground text-center w-24">
                      <span className="flex items-center justify-center gap-1"><Mail className="h-3.5 w-3.5 text-accent" /> Email</span>
                    </th>
                    <th className="px-3 py-2.5 font-bold text-foreground text-center w-24">
                      <span className="flex items-center justify-center gap-1"><MessageCircle className="h-3.5 w-3.5 text-accent" /> Zalo</span>
                    </th>
                    <th className="px-3 py-2.5 font-bold text-foreground text-center w-24">
                      <span className="flex items-center justify-center gap-1"><Bot className="h-3.5 w-3.5 text-accent" /> Discord</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {EVENT_ROWS.map((row, idx) => {
                    const inAppField = `inAppOn${row.key}` as keyof PreferenceData;
                    const emailField = `emailOn${row.key}` as keyof PreferenceData;
                    const zaloField = `zaloOn${row.key}` as keyof PreferenceData;
                    const discordField = `discordOn${row.key}` as keyof PreferenceData;
                    const emailDisabled = isSystemDisabled("email", row.systemKey);
                    const zaloDisabled = isSystemDisabled("zalo", row.systemKey);
                    const discordDisabled = isSystemDisabled("discord", row.systemKey);

                    return (
                      <tr key={row.key} className={idx % 2 === 0 ? "bg-surface" : "bg-surface-2/30"}>
                        <td className="px-3 py-2.5 font-semibold text-foreground">{row.label}</td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={pref[inAppField]}
                            onChange={() => toggle(inAppField)}
                            className="rounded border-line text-accent h-4 w-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={pref[emailField] && !emailDisabled}
                            disabled={emailDisabled}
                            onChange={() => toggle(emailField)}
                            title={emailDisabled ? "Quản trị viên đã tắt kênh Email cho loại thông báo này" : undefined}
                            className="rounded border-line text-accent h-4 w-4 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={pref[zaloField] && !zaloDisabled}
                            disabled={zaloDisabled}
                            onChange={() => toggle(zaloField)}
                            title={zaloDisabled ? "Quản trị viên đã tắt/chưa cấu hình kênh Zalo cho loại thông báo này" : undefined}
                            className="rounded border-line text-accent h-4 w-4 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={pref[discordField] && !discordDisabled}
                            disabled={discordDisabled}
                            onChange={() => toggle(discordField)}
                            title={discordDisabled ? "Quản trị viên đã tắt/chưa cấu hình kênh Discord cho loại thông báo này" : undefined}
                            className="rounded border-line text-accent h-4 w-4 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!systemDefaults.zaloEnabled && (
              <div className="rounded-lg bg-surface-2/60 border border-line p-2.5 text-[11px] text-muted flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" /> Hệ thống chưa bật tích hợp Zalo — cột Zalo sẽ khả dụng sau khi Quản trị viên cấu hình.
              </div>
            )}
            {!systemDefaults.discordEnabled && (
              <div className="rounded-lg bg-surface-2/60 border border-line p-2.5 text-[11px] text-muted flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 shrink-0" /> Hệ thống chưa bật tích hợp Discord — cột Discord sẽ khả dụng sau khi Quản trị viên cấu hình.
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-accent-subtle border border-accent/25 p-2.5 text-[11px] text-accent font-semibold">{error}</div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
              {saved && (
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mr-auto">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Đã lưu
                </span>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-bold gap-1.5 h-9 bg-accent border-accent hover:bg-accent/90"
              >
                {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                Lưu Tùy Chọn
              </Button>
            </div>
          </>
        ) : (
          <div className="text-xs text-accent font-semibold">{error || "Không thể tải dữ liệu"}</div>
        )}
      </div>
    </Dialog>
  );
}
