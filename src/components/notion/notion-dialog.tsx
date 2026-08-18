"use client";

import { useState } from "react";
import {
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  ArrowRight,
  ListTodo,
  FileCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { NotionDatabaseInfo, NotionTaskItem } from "@/lib/notion";
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

export function NotionDialog({
  projectId,
  open,
  onOpenChange,
  onImportSuccess,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [step, setStep] = useState<"token" | "databases" | "inspect">("token");

  // State kiểm tra kết nối
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    botName?: string;
    workspaceName?: string;
    error?: string;
  } | null>(null);

  // State danh sách Database
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [databases, setDatabases] = useState<NotionDatabaseInfo[]>([]);
  const [selectedDb, setSelectedDb] = useState<NotionDatabaseInfo | null>(null);

  // State danh sách Tasks từ Notion
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [tasks, setTasks] = useState<NotionTaskItem[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  // State Import
  const [importing, setImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState("");

  // 1. Kiểm tra kết nối Token
  async function handleTestConnection() {
    if (!apiKey.trim()) {
      setErrorMsg("Vui lòng nhập Notion API Key (Internal Integration Token)");
      return;
    }
    setErrorMsg("");
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/integrations/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTestResult({ success: false, error: data.error ?? "Không thể kết nối tới Notion" });
        return;
      }

      setTestResult({
        success: true,
        botName: data.botName,
        workspaceName: data.workspaceName,
      });

      // Tự động load danh sách Database sau khi test thành công
      await handleFetchDatabases();
    } catch {
      setTestResult({ success: false, error: "Lỗi kết nối mạng tới máy chủ" });
    } finally {
      setTesting(false);
    }
  }

  // 2. Tải danh sách Database
  async function handleFetchDatabases() {
    setLoadingDatabases(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/integrations/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "databases", apiKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Không lấy được danh sách Database");
        return;
      }
      setDatabases(data.databases || []);
      setStep("databases");
    } catch {
      setErrorMsg("Lỗi khi tải Database từ Notion");
    } finally {
      setLoadingDatabases(false);
    }
  }

  // 3. Đọc dữ liệu tasks từ Database được chọn
  async function handleInspectDatabase(db: NotionDatabaseInfo) {
    setSelectedDb(db);
    setLoadingTasks(true);
    setErrorMsg("");
    setStep("inspect");
    try {
      const res = await fetch("/api/integrations/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tasks",
          apiKey,
          databaseId: db.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Không tải được tasks từ Database này");
        return;
      }
      setTasks(data.tasks || []);
    } catch {
      setErrorMsg("Lỗi khi đọc danh sách task từ Notion");
    } finally {
      setLoadingTasks(false);
    }
  }

  // 4. Nhập tasks vào Board KZTEK
  async function handleImportTasks() {
    if (!tasks.length) return;
    setImporting(true);
    setErrorMsg("");
    setImportSuccessMsg("");

    try {
      const res = await fetch(`/api/projects/${projectId}/notion/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Không thể nhập task từ Notion");
        return;
      }

      setImportSuccessMsg(`Đã nhập thành công ${data.importedCount} tasks từ Notion vào Board!`);
      onImportSuccess();
    } catch {
      setErrorMsg("Lỗi kết nối khi nhập dữ liệu");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-white font-bold text-base shadow-sm">
              N
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                Notion Live Hub & Trình Kiểm Tra Trực Tiếp
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  Official API v1
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Liên kết trực tiếp tới Workspace Notion của KZTEK để kiểm tra, duyệt và đồng bộ task
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Thanh chuyển bước */}
        <div className="flex items-center justify-between border-b border-line py-2 px-1 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep("token")}
              className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded cursor-pointer ${
                step === "token" ? "bg-surface-2 text-foreground font-semibold" : "text-muted hover:text-foreground"
              }`}
            >
              1. Token & Kết nối
            </button>
            <ArrowRight className="h-3 w-3 text-muted" />
            <button
              onClick={() => databases.length > 0 && setStep("databases")}
              disabled={databases.length === 0}
              className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded cursor-pointer ${
                step === "databases"
                  ? "bg-surface-2 text-foreground font-semibold"
                  : "text-muted hover:text-foreground disabled:opacity-40"
              }`}
            >
              2. Danh sách Database ({databases.length})
            </button>
            <ArrowRight className="h-3 w-3 text-muted" />
            <button
              onClick={() => selectedDb && setStep("inspect")}
              disabled={!selectedDb}
              className={`flex items-center gap-1.5 font-medium px-2 py-1 rounded cursor-pointer ${
                step === "inspect"
                  ? "bg-surface-2 text-foreground font-semibold"
                  : "text-muted hover:text-foreground disabled:opacity-40"
              }`}
            >
              3. Kiểm tra Tasks trực tiếp ({tasks.length})
            </button>
          </div>

          {testResult?.success && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đã kết nối: {testResult.botName}
            </span>
          )}
        </div>

        {/* Thân Modal */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {importSuccessMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400 border border-emerald-500/20">
              <FileCheck className="h-4 w-4 shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {/* BƯỚC 1: NHẬP TOKEN & TEST */}
          {step === "token" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-surface p-4 space-y-3">
                <Label htmlFor="notionToken" className="text-xs font-semibold">
                  Notion Internal Integration Token (API Secret)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="notionToken"
                    type="password"
                    placeholder="secret_... hoặc ntn_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="text-xs font-mono"
                  />
                  <Button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="shrink-0"
                    size="sm"
                  >
                    {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Kiểm tra kết nối
                  </Button>
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  💡 <strong>Cách lấy Token:</strong> Truy cập{" "}
                  <a
                    href="https://www.notion.so/my-integrations"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline inline-flex items-center gap-0.5"
                  >
                    notion.so/my-integrations <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                  , tạo Integration mới, sau đó vào trang Database Notion cần quản lý bấm <strong>Add connections</strong> và chọn Integration của bạn.
                </p>
              </div>

              {testResult && (
                <div
                  className={`rounded-xl border p-4 text-xs space-y-2 ${
                    testResult.success
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
                      : "border-red-500/30 bg-red-500/5 text-red-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Kết nối Notion thành công!
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        Kết nối thất bại
                      </>
                    )}
                  </div>
                  {testResult.success ? (
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <span className="text-muted">Tên Bot:</span> <strong>{testResult.botName}</strong>
                      </div>
                      <div>
                        <span className="text-muted">Workspace:</span> <strong>{testResult.workspaceName}</strong>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-red-400">{testResult.error}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* BƯỚC 2: CHỌN DATABASE */}
          {step === "databases" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Chọn Database Notion để kiểm tra dữ liệu
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFetchDatabases}
                  disabled={loadingDatabases}
                  className="h-7 text-xs"
                >
                  <RefreshCw className={`h-3 w-3 ${loadingDatabases ? "animate-spin" : ""}`} />
                  Làm mới danh sách
                </Button>
              </div>

              {loadingDatabases ? (
                <div className="flex h-40 items-center justify-center text-xs text-muted">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang tải danh sách Database từ Notion...
                </div>
              ) : databases.length === 0 ? (
                <div className="rounded-xl border border-line bg-surface p-6 text-center text-xs text-muted space-y-2">
                  <Database className="h-8 w-8 mx-auto text-muted/60" />
                  <p className="font-semibold text-foreground">Không tìm thấy Database nào</p>
                  <p>
                    Vui lòng mở Database trên Notion $\rightarrow$ Bấm nút <code>...</code> (góc phải trên) $\rightarrow$ Chọn <strong>Add connections</strong> và chọn Bot của bạn.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {databases.map((db) => (
                    <div
                      key={db.id}
                      onClick={() => handleInspectDatabase(db)}
                      className="group rounded-xl border border-line bg-surface p-3.5 hover:border-accent/50 hover:bg-surface-2 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-foreground group-hover:text-accent flex items-center gap-1.5">
                            <Database className="h-4 w-4 text-accent shrink-0" />
                            {db.title}
                          </h4>
                          <a
                            href={db.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted hover:text-foreground"
                            title="Mở trên Notion"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {Object.values(db.properties).slice(0, 4).map((p, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-surface-2 group-hover:bg-line px-1.5 py-0.5 text-[10px] text-muted"
                            >
                              {p.name} ({p.type})
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-end text-xs font-medium text-accent">
                        Kiểm tra Tasks <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* BƯỚC 3: LIVE INSPECTOR - KIỂM TRA TASKS TRỰC TIẾP TỪ NOTION */}
          {step === "inspect" && selectedDb && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-accent" />
                    Database: <span className="text-accent">{selectedDb.title}</span>
                  </h3>
                  <p className="text-[11px] text-muted">
                    Hiển thị dữ liệu thực tế đang có trên Notion ({tasks.length} tasks)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInspectDatabase(selectedDb)}
                    disabled={loadingTasks}
                    className="h-8 text-xs"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingTasks ? "animate-spin" : ""}`} />
                    Tải lại
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleImportTasks}
                    disabled={importing || tasks.length === 0}
                    className="h-8 text-xs font-semibold"
                  >
                    {importing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    )}
                    Nhập ({tasks.length}) Task vào Board
                  </Button>
                </div>
              </div>

              {loadingTasks ? (
                <div className="flex h-48 items-center justify-center text-xs text-muted">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Đang truy vấn trực tiếp từ Notion...
                </div>
              ) : tasks.length === 0 ? (
                <div className="rounded-xl border border-line bg-surface p-8 text-center text-xs text-muted space-y-2">
                  <ListTodo className="h-8 w-8 mx-auto text-muted/60" />
                  <p className="font-semibold text-foreground">Database này chưa có Task nào</p>
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-surface overflow-hidden">
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-surface-2 text-muted uppercase text-[10px] font-semibold border-b border-line">
                        <tr>
                          <th className="p-2.5">Tiêu đề Task (Notion)</th>
                          <th className="p-2.5">Trạng thái</th>
                          <th className="p-2.5">Ưu tiên</th>
                          <th className="p-2.5">Người nhận</th>
                          <th className="p-2.5">Hạn chót</th>
                          <th className="p-2.5 text-right">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {tasks.map((t) => (
                          <tr key={t.id} className="hover:bg-surface-2/60 transition-colors">
                            <td className="p-2.5 font-medium text-foreground max-w-[240px] truncate">
                              {t.title}
                            </td>
                            <td className="p-2.5">
                              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-medium">
                                {t.status || "Chưa set"}
                              </span>
                            </td>
                            <td className="p-2.5">
                              <span className="text-[11px] text-muted">{t.priority || "Medium"}</span>
                            </td>
                            <td className="p-2.5 text-muted truncate max-w-[120px]">
                              {t.assigneeName || "—"}
                            </td>
                            <td className="p-2.5 text-muted">
                              {t.dueDate ? t.dueDate.slice(0, 10) : "—"}
                            </td>
                            <td className="p-2.5 text-right">
                              <a
                                href={t.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-accent hover:underline text-[11px]"
                              >
                                Xem <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
          <div>
            {step !== "token" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(step === "inspect" ? "databases" : "token")}
              >
                ← Quay lại
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
