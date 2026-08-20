"use client";

import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  Activity,
  Calculator,
  FileText,
  Keyboard,
  Maximize2,
  Minimize2,
  Clock,
  Layers,
  Sparkles,
  Command,
} from "lucide-react";

interface DesktopStatusBarProps {
  currentProjectName?: string;
  onToggleCalculator: () => void;
  onToggleScratchpad: () => void;
  onOpenShortcuts: () => void;
  onOpenCommandPalette: () => void;
  activeViews?: string;
}

export function DesktopStatusBar({
  currentProjectName = "KZTEK Work",
  onToggleCalculator,
  onToggleScratchpad,
  onOpenShortcuts,
  onOpenCommandPalette,
  activeViews = "Dual-Pane (50:50)",
}: DesktopStatusBarProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [pingMs, setPingMs] = useState(16);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Online / Offline listener & Ping simulation
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Ping check
    const pingInterval = setInterval(async () => {
      const start = performance.now();
      try {
        await fetch("/api/auth/me", { method: "HEAD" });
        const latency = Math.round(performance.now() - start);
        setPingMs(Math.max(8, Math.min(latency, 120)));
        setIsOnline(true);
      } catch (err) {
        // Fallback
        setPingMs(24);
      }
    }, 15000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(pingInterval);
    };
  }, []);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <footer className="h-7 bg-[#1A1438] border-t border-[#312564] px-3 flex items-center justify-between text-[11px] text-zinc-300 select-none z-30 flex-shrink-0">
      {/* Left section: System status & active project */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-mono ${
            isOnline ? "text-emerald-400 bg-emerald-950/40" : "text-accent bg-accent/15"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-400 animate-pulse" : "bg-accent"
            }`}
          />
          <span>{isOnline ? `Online (${pingMs}ms)` : "Offline"}</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 border-l border-zinc-700/60 pl-3">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="font-medium text-zinc-200 truncate max-w-[200px]">
            {currentProjectName}
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-zinc-400 border-l border-zinc-700/60 pl-3">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{activeViews}</span>
        </div>
      </div>

      {/* Center section: Quick command trigger */}
      <div className="hidden lg:flex items-center">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-300 border border-zinc-700/50 transition-colors"
        >
          <Command className="w-3 h-3 text-primary" />
          <span>Command Palette</span>
          <kbd className="px-1 py-0.2 bg-zinc-900 text-[9px] rounded font-mono border border-zinc-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right section: Tools & Widgets toggles */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleCalculator}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Mở Máy Tính Năng Suất (Alt+C)"
        >
          <Calculator className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline">Máy tính</span>
        </button>

        <button
          type="button"
          onClick={onToggleScratchpad}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Mở Ghi Chú Nhanh (Alt+S)"
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Ghi chú</span>
        </button>

        <button
          type="button"
          onClick={onOpenShortcuts}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Phím tắt (? / Ctrl+/)"
        >
          <Keyboard className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Phím tắt</span>
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Toàn màn hình (Alt+F)"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-1 border-l border-zinc-700/60 pl-2 font-mono text-zinc-400">
          <Clock className="w-3 h-3 text-zinc-500" />
          <span>{currentTime || "00:00:00"}</span>
        </div>
      </div>
    </footer>
  );
}
