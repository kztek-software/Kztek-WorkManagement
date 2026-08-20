"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Settings,
  Mail,
  Building2,
  BellRing,
  Activity,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SystemConfigState = {
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    from: string;
    fromName: string;
  };
  branding: {
    systemName: string;
    companyName: string;
    hotline: string;
    supportEmail: string;
    website: string;
    appUrl: string;
  };
  notifications: {
    notifyOnAssign: boolean;
    notifyOnStatusChange: boolean;
    notifyOnComment: boolean;
    enableRealtimeSse: boolean;
  };
  updatedAt?: string;
  updatedBy?: string;
};

export default function AdminSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [activeTab, setActiveTab] = useState<"smtp" | "branding" | "notifications" | "diagnostics">("smtp");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Success / Error Alerts
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Test Email state
  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Config State
  const [config, setConfig] = useState<SystemConfigState>({
    smtp: {
      host: "",
      port: 587,
      user: "",
      pass: "",
      secure: false,
      from: "no-reply@kztek.net",
      fromName: "KZTEK Work Management",
    },
    branding: {
      systemName: "KZTEK Work Management",
      companyName: "CÔNG TY CỔ PHẦN CÔNG NGHỆ KZTEK",
      hotline: "024 3782 2288",
      supportEmail: "support@kztek.net",
      website: "https://kztek.net",
      appUrl: "http://localhost:3000",
    },
    notifications: {
      notifyOnAssign: true,
      notifyOnStatusChange: true,
      notifyOnComment: true,
      enableRealtimeSse: true,
    },
  });

  async function fetchConfig() {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/system/config");
      if (res.status === 403) {
        setAccessDenied(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Không thể tải cấu hình hệ thống");
      }
    } catch {
      setErrorMessage("Lỗi kết nối tới máy chủ cấu hình");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConfig();
  }, []);

  async function handleSaveConfig(e?: React.FormEvent | React.MouseEvent) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/system/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("✓ Lưu cấu hình hệ thống thành công!");
        if (data.config) {
          setConfig(data.config);
        }
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setErrorMessage(data.error || "Lỗi khi lưu cấu hình");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage("Không thể kết nối máy chủ để lưu cấu hình: " + msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleSendTestEmail() {
    if (!testEmail) {
      alert("Vui lòng nhập địa chỉ email nhận kiểm tra");
      return;
    }

    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/notifications/email-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: testEmail,
          recipientName: "Quản trị viên Kiểm thử",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult({
          success: true,
          message: data.message || "Gửi email thử nghiệm thành công! Kiểm tra hộp thư.",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Gửi email thử nghiệm thất bại.",
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "Lỗi kết nối khi gửi thử nghiệm email",
      });
    } finally {
      setSendingTest(false);
    }
  }

  function applyPreset(type: "gmail" | "office365" | "custom") {
    if (type === "gmail") {
      setConfig((prev) => ({
        ...prev,
        smtp: {
          ...prev.smtp,
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
        },
      }));
    } else if (type === "office365") {
      setConfig((prev) => ({
        ...prev,
        smtp: {
          ...prev.smtp,
          host: "smtp.office365.com",
          port: 587,
          secure: false,
        },
      }));
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-muted">
          <RefreshCw className="h-8 w-8 animate-spin text-accent" />
          <p className="text-xs font-semibold">Đang tải cấu hình hệ thống...</p>
        </div>
      </div>
    );
  }

  // Access Denied Screen if user is not ADMIN
  if (accessDenied) {
    return (
      <div className="flex h-full items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full rounded-2xl border border-accent/30 bg-surface p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-accent mb-4 ring-8 ring-accent/5">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h2 className="text-lg font-bold text-foreground">Truy Cập Bị Từ Chối</h2>
          <p className="text-xs text-muted leading-relaxed mt-2">
            Trang Cấu hình Hệ thống được bảo vệ nghiêm ngặt. Chỉ có tài khoản với quyền <strong>Quản Trị Viên (ADMIN)</strong> mới có quyền xem và điều chỉnh các thông số này.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Button
              onClick={() => router.push(`/projects/${projectId}/board`)}
              className="font-bold text-xs gap-1.5 cursor-pointer bg-accent hover:bg-accent/90"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại Board Công Việc
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-3 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-[#d44715] text-white shadow-lg shadow-accent/25 ring-2 ring-white/10">
            <Settings className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-foreground min-w-0">Trung Tâm Cấu Hình Hệ Thống</h1>
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-black text-accent border border-accent/30 flex items-center gap-1 shrink-0">
                <ShieldCheck className="h-3 w-3" /> CHỈ ADMIN
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Quản lý máy chủ Email SMTP, nhận diện thương hiệu công ty và quy tắc thông báo giao việc
            </p>
          </div>
        </div>

        <Button
          onClick={handleSaveConfig}
          disabled={saving}
          className="w-full sm:w-auto shrink-0 font-bold text-xs gap-1.5 bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/25 cursor-pointer"
        >
          {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {saving ? (
            <span>Đang lưu...</span>
          ) : (
            <>
              <span className="sm:hidden">Lưu</span>
              <span className="hidden sm:inline">Lưu Toàn Bộ Cấu Hình</span>
            </>
          )}
        </Button>
      </div>

      {/* Status Alerts */}
      {successMessage && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs text-emerald-600 font-semibold flex items-center gap-2 animate-fade-in-up">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl bg-accent-subtle border border-accent/30 p-3.5 text-xs text-accent font-semibold flex items-center gap-2 animate-fade-in-up">
          <AlertCircle className="h-4 w-4 shrink-0" /> {errorMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-line pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("smtp")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "smtp"
              ? "border-accent text-accent bg-accent/5 rounded-t-lg"
              : "border-transparent text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="sm:hidden">Email SMTP</span>
          <span className="hidden sm:inline">Máy Chủ Email (SMTP)</span>
        </button>

        <button
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "branding"
              ? "border-accent text-accent bg-accent/5 rounded-t-lg"
              : "border-transparent text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="sm:hidden">Thương Hiệu</span>
          <span className="hidden sm:inline">Thương Hiệu & Đơn Vị</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "notifications"
              ? "border-accent text-accent bg-accent/5 rounded-t-lg"
              : "border-transparent text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <BellRing className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="sm:hidden">Thông Báo</span>
          <span className="hidden sm:inline">Quy Tắc Thông Báo</span>
        </button>

        <button
          onClick={() => setActiveTab("diagnostics")}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "diagnostics"
              ? "border-accent text-accent bg-accent/5 rounded-t-lg"
              : "border-transparent text-muted hover:text-foreground hover:bg-surface-2"
          }`}
        >
          <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="sm:hidden">Chẩn Đoán</span>
          <span className="hidden sm:inline">Chẩn Đoán & Trạng Thái</span>
        </button>
      </div>

      {/* Tab 1: Cấu hình Email & SMTP */}
      {activeTab === "smtp" && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="rounded-2xl border border-line bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <div className="text-xs font-bold text-foreground">Thiết Lập Nhanh Nhà Cung Cấp Email</div>
              <div className="text-[11px] text-muted">Chọn mẫu cấu hình máy chủ phổ biến để tự động điền thông số kết nối</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("gmail")}
                className="text-xs h-8 cursor-pointer font-semibold"
              >
                Google Gmail
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset("office365")}
                className="text-xs h-8 cursor-pointer font-semibold"
              >
                Microsoft 365
              </Button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig(e); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-sm">
              <div className="font-bold text-xs text-foreground flex items-center gap-1.5 border-b border-line/60 pb-2">
                <Server className="h-3.5 w-3.5 text-accent" /> Thông Số Kết Nối Máy Chủ SMTP
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">SMTP Host (Máy chủ gửi) *</Label>
                <Input
                  placeholder="VD: smtp.gmail.com hoặc mail.kztek.net"
                  value={config.smtp.host}
                  onChange={(e) =>
                    setConfig({ ...config, smtp: { ...config.smtp, host: e.target.value } })
                  }
                  className="h-8.5 text-xs bg-surface-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Cổng (Port) *</Label>
                  <Input
                    type="number"
                    placeholder="587 hoặc 465"
                    value={config.smtp.port}
                    onChange={(e) =>
                      setConfig({ ...config, smtp: { ...config.smtp, port: Number(e.target.value) } })
                    }
                    className="h-8.5 text-xs bg-surface-2"
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={config.smtp.secure}
                      onChange={(e) =>
                        setConfig({ ...config, smtp: { ...config.smtp, secure: e.target.checked } })
                      }
                      className="rounded border-line text-accent h-4 w-4"
                    />
                    <span className="text-xs font-medium">Bật SSL/TLS (Port 465)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Tài khoản gửi (Username / Email) *</Label>
                <Input
                  placeholder="VD: notification@kztek.net"
                  value={config.smtp.user}
                  onChange={(e) =>
                    setConfig({ ...config, smtp: { ...config.smtp, user: e.target.value } })
                  }
                  className="h-8.5 text-xs bg-surface-2"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Mật khẩu / App Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu ứng dụng..."
                    value={config.smtp.pass || ""}
                    onChange={(e) =>
                      setConfig({ ...config, smtp: { ...config.smtp, pass: e.target.value } })
                    }
                    className="h-8.5 text-xs bg-surface-2 pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground cursor-pointer transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="font-bold text-xs text-foreground flex items-center gap-1.5 border-b border-line/60 pb-2">
                  <Mail className="h-3.5 w-3.5 text-accent" /> Thông Tin Người Gửi Hiển Thị
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Địa chỉ Email người gửi (From Address)</Label>
                  <Input
                    placeholder="no-reply@kztek.net"
                    value={config.smtp.from}
                    onChange={(e) =>
                      setConfig({ ...config, smtp: { ...config.smtp, from: e.target.value } })
                    }
                    className="h-8.5 text-xs bg-surface-2"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Tên hiển thị người gửi (Sender Name)</Label>
                  <Input
                    placeholder="KZTEK Work Management"
                    value={config.smtp.fromName}
                    onChange={(e) =>
                      setConfig({ ...config, smtp: { ...config.smtp, fromName: e.target.value } })
                    }
                    className="h-8.5 text-xs bg-surface-2"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-accent flex items-center gap-1">
                      <span>Địa chỉ Web/App hệ thống (App Base URL) *</span>
                    </Label>
                    <span className="text-[10px] text-muted font-mono">Dùng cho link trong email</span>
                  </div>
                  <Input
                    placeholder="VD: https://work.kztek.net hoặc http://192.168.1.100:3000"
                    value={config.branding.appUrl}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        branding: { ...config.branding, appUrl: e.target.value },
                      })
                    }
                    className="h-8.5 text-xs bg-surface-2 font-mono font-semibold text-accent"
                    required
                  />
                  <p className="text-[10px] text-muted">
                    Địa chỉ máy chủ thực tế để đính kèm vào nút <i>"Xem công việc"</i>, <i>"Trả lời"</i> trong email (thay vì link localhost).
                  </p>
                </div>

                {/* Quick Live Test Card */}
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-3.5 space-y-2 mt-4">
                  <div className="text-xs font-bold text-accent flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Kiểm Tra Kết Nối SMTP Trực Tiếp
                  </div>
                  <p className="text-[11px] text-muted">
                    Nhập địa chỉ email bất kỳ để gửi ngay một email thử nghiệm kiểm tra đường truyền
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="email"
                      placeholder="email-nhan@domain.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="h-8 text-xs bg-surface"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSendTestEmail}
                      disabled={sendingTest}
                      className="h-8 text-xs shrink-0 cursor-pointer font-semibold gap-1 bg-accent hover:bg-accent/90 text-white"
                    >
                      {sendingTest ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Gửi thử
                    </Button>
                  </div>
                  {testResult && (
                    <div
                      className={`text-[11px] p-2 rounded border mt-2 ${
                        testResult.success
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 font-semibold"
                          : "bg-accent-subtle border-accent/20 text-accent"
                      }`}
                    >
                      {testResult.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-line flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="font-bold text-xs gap-1.5 bg-accent hover:bg-accent/90 text-white cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" /> {saving ? "Đang lưu..." : "Lưu Cấu Hình SMTP"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Cấu hình Thương hiệu & Đơn vị */}
      {activeTab === "branding" && (
        <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig(e); }} className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-sm max-w-2xl">
          <div className="font-bold text-xs text-foreground flex items-center gap-1.5 border-b border-line/60 pb-2">
            <Building2 className="h-4 w-4 text-accent" /> Nhận Diện Thương Hiệu & Thông Tin Doanh Nghiệp
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tên hệ thống ứng dụng</Label>
            <Input
              value={config.branding.systemName}
              onChange={(e) =>
                setConfig({ ...config, branding: { ...config.branding, systemName: e.target.value } })
              }
              className="h-8.5 text-xs bg-surface-2"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tên công ty / Doanh nghiệp</Label>
            <Input
              value={config.branding.companyName}
              onChange={(e) =>
                setConfig({ ...config, branding: { ...config.branding, companyName: e.target.value } })
              }
              className="h-8.5 text-xs bg-surface-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Hotline hỗ trợ kỹ thuật</Label>
              <Input
                value={config.branding.hotline}
                onChange={(e) =>
                  setConfig({ ...config, branding: { ...config.branding, hotline: e.target.value } })
                }
                className="h-8.5 text-xs bg-surface-2"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Email hỗ trợ kỹ thuật</Label>
              <Input
                value={config.branding.supportEmail}
                onChange={(e) =>
                  setConfig({ ...config, branding: { ...config.branding, supportEmail: e.target.value } })
                }
                className="h-8.5 text-xs bg-surface-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Trang web công ty (Website URL)</Label>
              <Input
                placeholder="https://kztek.net"
                value={config.branding.website}
                onChange={(e) =>
                  setConfig({ ...config, branding: { ...config.branding, website: e.target.value } })
                }
                className="h-8.5 text-xs bg-surface-2"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-accent flex items-center gap-1">
                  <span>Địa chỉ Web/App hệ thống (Base URL) *</span>
                </Label>
                <span className="text-[10px] text-muted font-mono">Dùng cho liên kết trong Email</span>
              </div>
              <Input
                placeholder="VD: https://work.kztek.net hoặc http://192.168.1.100:3000"
                value={config.branding.appUrl}
                onChange={(e) =>
                  setConfig({ ...config, branding: { ...config.branding, appUrl: e.target.value } })
                }
                className="h-8.5 text-xs bg-surface-2 font-mono font-semibold text-accent"
                required
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-[11px] text-muted space-y-1">
            <div className="font-bold text-accent">📌 Lưu ý về Địa chỉ Web/App hệ thống:</div>
            <div>
              Đây là URL công khai hoặc nội bộ thực tế được đính kèm vào nút <strong>"Xem công việc"</strong>, <strong>"Phản hồi bình luận"</strong> trong tất cả các email thông báo gửi đến người dùng (thay vì link <code className="font-mono text-foreground bg-surface-2 px-1 py-0.2 rounded">localhost:3000</code>).
            </div>
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <Button
              type="button"
              onClick={handleSaveConfig}
              disabled={saving}
              className="font-bold text-xs gap-1.5 bg-accent hover:bg-accent/90 text-white cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? "Đang lưu..." : "Lưu Thông Tin Thương Hiệu & Địa Chỉ App"}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Quy tắc Thông báo */}
      {activeTab === "notifications" && (
        <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig(e); }} className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-sm max-w-2xl">
          <div className="font-bold text-xs text-foreground flex items-center gap-1.5 border-b border-line/60 pb-2">
            <BellRing className="h-4 w-4 text-accent" /> Quy Tắc Kích Hoạt Thông Báo Tự Động
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-line bg-surface-2/60 hover:bg-surface-2 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.notifications.notifyOnAssign}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notifications: { ...config.notifications, notifyOnAssign: e.target.checked },
                  })
                }
                className="rounded border-line text-accent h-4 w-4 mt-0.5"
              />
              <div>
                <div className="text-xs font-bold text-foreground">Gửi email khi giao việc (Task Assignment)</div>
                <div className="text-[11px] text-muted">
                  Tự động gửi email thông báo chi tiết đến người được chỉ định phụ trách công việc mới hoặc nhận bàn giao.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-line bg-surface-2/60 hover:bg-surface-2 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.notifications.notifyOnStatusChange}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notifications: { ...config.notifications, notifyOnStatusChange: e.target.checked },
                  })
                }
                className="rounded border-line text-accent h-4 w-4 mt-0.5"
              />
              <div>
                <div className="text-xs font-bold text-foreground">Gửi email khi thay đổi trạng thái (Status Changed)</div>
                <div className="text-[11px] text-muted">
                  Thông báo cho người tạo và người phụ trách khi task chuyển cột (TODO, IN_PROGRESS, DONE).
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-line bg-surface-2/60 hover:bg-surface-2 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.notifications.notifyOnComment}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notifications: { ...config.notifications, notifyOnComment: e.target.checked },
                  })
                }
                className="rounded border-line text-accent h-4 w-4 mt-0.5"
              />
              <div>
                <div className="text-xs font-bold text-foreground">Gửi email khi có bình luận mới (Task Comments)</div>
                <div className="text-[11px] text-muted">
                  Thông báo cho những người liên quan khi có thành viên thảo luận trong task.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-line bg-surface-2/60 hover:bg-surface-2 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={config.notifications.enableRealtimeSse}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    notifications: { ...config.notifications, enableRealtimeSse: e.target.checked },
                  })
                }
                className="rounded border-line text-accent h-4 w-4 mt-0.5"
              />
              <div>
                <div className="text-xs font-bold text-foreground">Kích hoạt Real-time Server-Sent Events (SSE)</div>
                <div className="text-[11px] text-muted">
                  Tự động làm mới bảng Kanban trong thời gian thực khi có thay đổi công việc mà không cần F5.
                </div>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-line flex justify-end">
            <Button
              type="button"
              onClick={handleSaveConfig}
              disabled={saving}
              className="font-bold text-xs gap-1.5 bg-accent hover:bg-accent/90 text-white cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" /> {saving ? "Đang lưu..." : "Lưu Quy Tắc Thông Báo"}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 4: Chẩn đoán & Trạng thái */}
      {activeTab === "diagnostics" && (
        <div className="rounded-2xl border border-line bg-surface p-6 space-y-4 shadow-sm max-w-2xl">
          <div className="font-bold text-xs text-foreground flex items-center gap-1.5 border-b border-line/60 pb-2">
            <Activity className="h-4 w-4 text-accent" /> Thông Số Môi Trường & Chẩn Đoán Hệ Thống
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-line/50">
              <span className="text-muted font-medium">Phiên bản hệ thống:</span>
              <span className="font-bold font-mono text-foreground">v2.4.0-enterprise (Build 2026.08)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line/50">
              <span className="text-muted font-medium">Framework & Engine:</span>
              <span className="font-bold font-mono text-foreground">Next.js 16 (App Router) + React 19</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line/50">
              <span className="text-muted font-medium">Cơ sở dữ liệu:</span>
              <span className="font-bold font-mono text-foreground">SQLite (WAL mode with Better-SQLite3)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line/50">
              <span className="text-muted font-medium">Dịch vụ Email:</span>
              <span className="font-bold font-mono text-emerald-600">SMTP Engine RFC 5321 + Simulated Outbox</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line/50">
              <span className="text-muted font-medium">Địa chỉ Web/App hệ thống:</span>
              <span className="font-bold font-mono text-accent">{config.branding.appUrl || "http://localhost:3000"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-line/50">
              <span className="text-muted font-medium">Cập nhật cấu hình lần cuối:</span>
              <span className="font-semibold text-foreground">
                {config.updatedAt ? new Date(config.updatedAt).toLocaleString("vi-VN") : "Chưa có"}
                {config.updatedBy ? ` (bởi ${config.updatedBy})` : ""}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
