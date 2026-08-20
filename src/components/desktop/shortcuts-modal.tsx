"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Command, Keyboard, Monitor, Sparkles, X } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const shortcutGroups = [
    {
      title: "Điều hướng & Tìm kiếm",
      shortcuts: [
        { keys: ["Ctrl", "K"], desc: "Mở Command Palette toàn hệ thống" },
        { keys: ["?"], desc: "Mở bảng trợ giúp phím tắt này" },
        { keys: ["Esc"], desc: "Đóng modal, bảng chọn hoặc hủy thao tác" },
      ],
    },
    {
      title: "Tiện ích & Máy tính Năng suất",
      shortcuts: [
        { keys: ["Alt", "C"], desc: "Bật / Tắt Widget Máy Tính Nổi (Smart Calculator)" },
        { keys: ["Alt", "S"], desc: "Bật / Tắt Khung Ghi Chú Nhanh (Scratchpad)" },
        { keys: ["Alt", "F"], desc: "Bật / Tắt chế độ Toàn màn hình (Fullscreen)" },
      ],
    },
    {
      title: "Thao tác Nhanh & Điều hướng Trang",
      shortcuts: [
        { keys: ["C"], desc: "Tạo công việc mới (khi không gõ văn bản)" },
        { keys: ["Alt", "1"], desc: "Đi đến Bảng Kanban Dự án" },
        { keys: ["Alt", "2"], desc: "Đi đến Dashboard Thống kê KPI" },
        { keys: ["Alt", "3"], desc: "Đi đến Quản lý Sprints" },
        { keys: ["Alt", "4"], desc: "Đi đến Phiếu Hỗ Trợ Khách Hàng (Tickets)" },
        { keys: ["Alt", "5"], desc: "Chuyển sang Chế độ Máy Tính Chuyên Dụng (/desktop)" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-card border-border/80 text-foreground p-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                Phím Tắt Máy Tính (Desktop Shortcuts)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Tăng tốc độ làm việc tối đa với các tổ hợp phím tắt trên máy tính
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {shortcutGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {group.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {group.shortcuts.map((item, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 border border-border/40 transition-colors"
                  >
                    <span className="text-xs font-medium text-foreground pr-3">{item.desc}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-background border border-border/80 rounded shadow-sm text-foreground">
                            {k}
                          </kbd>
                          {kIdx < item.keys.length - 1 && (
                            <span className="text-[10px] text-muted-foreground">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
            <Monitor className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Mẹo chuyên nghiệp:</strong> Nhấn{" "}
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-background border border-border rounded font-semibold text-foreground">
                Ctrl + K
              </kbd>{" "}
              ở bất kỳ màn hình nào để mở thanh tìm kiếm và hành động nhanh mà không cần dùng chuột.
            </div>
          </div>
        </div>

        <div className="bg-muted/30 p-3.5 border-t border-border/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors shadow-sm"
          >
            Đã hiểu (Esc)
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
