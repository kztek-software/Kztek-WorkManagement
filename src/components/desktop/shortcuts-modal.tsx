"use client";

import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Keyboard, Monitor, Sparkles } from "lucide-react";

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
      title: "Thao tác trong Dialog & Biểu Mẫu (Dialog Shortcuts)",
      shortcuts: [
        { keys: ["Ctrl", "Enter"], desc: "Lưu / Tạo mới / Gửi / Xác nhận nhanh trong Dialog & Form" },
        { keys: ["Esc"], desc: "Đóng Dialog hoặc Hủy chế độ đang sửa" },
        { keys: ["Alt", "E"], desc: "Bật / Tắt chế độ Sửa mô tả Markdown (Task Dialog)" },
        { keys: ["Alt", "1"], desc: "Tab Bình luận (Task) hoặc Chế độ Phòng ban (Member)" },
        { keys: ["Alt", "2"], desc: "Tab Lịch sử (Task) hoặc Chế độ Từng người (Member)" },
        { keys: ["Alt", "A"], desc: "Kích hoạt AI Gợi ý chi tiết (New Task Dialog)" },
        { keys: ["Alt", "N"], desc: "Mở tạo task mới vào Sprint (Sprint Hub)" },
        { keys: ["Alt", "B"], desc: "Mở gán việc từ Backlog vào Sprint (Sprint Hub)" },
        { keys: ["Alt", "L"], desc: "Sao chép nhanh liên kết Task / Mã phiếu hỗ trợ" },
        { keys: ["Alt", "C"], desc: "Chuyển đổi Ticket thành Task trên Board" },
        { keys: ["Alt", "D"], desc: "Điều phối Ticket sang dự án khác" },
        { keys: ["Alt", "R"], desc: "Làm mới dữ liệu trong Notion Hub / Hộp thư Mail" },
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

  const dialogHeader = (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center text-accent border border-accent/30">
        <Keyboard className="w-5 h-5" />
      </div>
      <div>
        <div className="text-base font-bold text-foreground flex items-center gap-2">
          Phím Tắt Máy Tính (Desktop Shortcuts)
        </div>
        <div className="text-xs text-muted font-normal">
          Tăng tốc độ làm việc tối đa với các tổ hợp phím tắt trên máy tính
        </div>
      </div>
    </div>
  );

  const dialogFooter = (
    <div className="flex justify-end gap-2 pt-2">
      <Button
        label="Đã hiểu (Esc)"
        size="small"
        onClick={onClose}
        className="font-bold bg-accent hover:bg-accent/90 text-white shadow-sm"
      />
    </div>
  );

  return (
    <Dialog
      header={dialogHeader}
      footer={dialogFooter}
      visible={isOpen}
      onHide={onClose}
      className="w-full max-w-2xl border border-line bg-surface rounded-2xl shadow-2xl"
    >
      <div className="space-y-6 pt-2 max-h-[70vh] overflow-y-auto pr-1">
        {shortcutGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {group.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {group.shortcuts.map((item, sIdx) => (
                <div
                  key={sIdx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2/60 hover:bg-surface-2 border border-line transition-colors"
                >
                  <span className="text-xs font-medium text-foreground pr-3">{item.desc}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        <kbd className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-surface border border-line rounded shadow-xs text-foreground">
                          {k}
                        </kbd>
                        {kIdx < item.keys.length - 1 && (
                          <span className="text-[10px] text-muted">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-start gap-3">
          <Monitor className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Mẹo chuyên nghiệp:</strong> Nhấn{" "}
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface border border-line rounded font-semibold text-foreground">
              Ctrl + K
            </kbd>{" "}
            ở bất kỳ màn hình nào để mở thanh tìm kiếm và hành động nhanh mà không cần dùng chuột.
          </div>
        </div>
      </div>
    </Dialog>
  );
}

