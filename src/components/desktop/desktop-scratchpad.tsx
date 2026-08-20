"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  X,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Save,
  Download,
} from "lucide-react";

interface DesktopScratchpadProps {
  onClose: () => void;
}

export function DesktopScratchpad({ onClose }: DesktopScratchpadProps) {
  const [content, setContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kztek_desktop_scratchpad");
      if (saved) {
        setContent(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto-save to localStorage
  const handleChange = (val: string) => {
    setContent(val);
    try {
      localStorage.setItem("kztek_desktop_scratchpad", val);
      setLastSaved(new Date().toLocaleTimeString("vi-VN"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClear = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ ghi chú nhanh này?")) {
      handleChange("");
    }
  };

  const lineCount = content ? content.split("\n").length : 0;
  const charCount = content.length;

  return (
    <div className="absolute right-6 top-16 z-40 w-96 bg-[#181236]/95 backdrop-blur-md border border-[#3E2D82] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-5 duration-150 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#251C53] via-[#332570] to-[#251C53] px-4 py-3 border-b border-[#3E2D82] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              Ghi Chú Nhanh (Scratchpad)
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/30 text-blue-300 font-normal">
                Auto-saved
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              {lastSaved ? `Đã lưu lúc ${lastSaved}` : "Tự động lưu vào máy tính"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Sao chép toàn bộ"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 hover:text-accent transition-colors"
            title="Xóa nội dung"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="p-3 bg-[#0F0B24]">
        <textarea
          rows={12}
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Viết ghi chú, ý tưởng, checklist việc cần làm hoặc đoạn mã tạm thời tại đây... (Tự động lưu)"
          className="w-full h-64 bg-transparent text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none resize-none font-sans leading-relaxed"
          autoFocus
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-[#0E0A24] border-t border-[#312564] flex items-center justify-between text-[10px] text-zinc-400">
        <div className="flex items-center gap-3">
          <span>{lineCount} dòng</span>
          <span>{charCount} ký tự</span>
        </div>
        <span>Phím tắt: Alt+S</span>
      </div>
    </div>
  );
}
