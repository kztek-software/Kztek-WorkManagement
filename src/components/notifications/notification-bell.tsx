"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, ExternalLink, Trash2, Clock, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, initials } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    avatarColor: string;
  } | null;
};

export function NotificationBell({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10s poll
    return () => clearInterval(interval);
  }, []);

  // Close when click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function markAsRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_all" }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }

  function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return "Vừa xong";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  return (
    <div className="relative" ref={popoverRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        className="relative h-8 w-8 text-muted hover:text-foreground cursor-pointer"
        title="Thông báo giao việc"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 bottom-full mb-2 w-80 sm:w-96 rounded-xl border border-line bg-surface-2 p-0 shadow-2xl z-50 animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line p-3">
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <Bell className="h-3.5 w-3.5 text-accent" />
              Thông Báo Giao Việc & Hoạt Động
              {unreadCount > 0 && (
                <span className="rounded-full bg-accent/20 px-1.5 py-0.2 text-[10px] text-accent font-semibold">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-accent hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <CheckCheck className="h-3 w-3" /> Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-line/60">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted space-y-1">
                <Bell className="h-6 w-6 mx-auto text-muted/50 mb-1" />
                <p className="font-semibold text-foreground">Không có thông báo nào</p>
                <p className="text-[11px]">Bạn sẽ nhận được thông báo khi có người giao việc hoặc cập nhật task.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 transition-colors flex items-start gap-2.5 ${
                    n.read ? "bg-transparent opacity-80" : "bg-accent/5 font-medium"
                  } hover:bg-surface`}
                >
                  <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                    <AvatarFallback color={n.actor?.avatarColor || "#6366f1"} className="text-[9px]">
                      {n.actor ? initials(n.actor.name) : "KZ"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-foreground truncate">{n.title}</span>
                      <span className="text-[10px] text-muted shrink-0">{formatTime(n.createdAt)}</span>
                    </div>

                    <p className="text-[11px] text-muted leading-snug mt-0.5 break-words">
                      {n.message}
                    </p>

                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => {
                          markAsRead(n.id);
                          setOpen(false);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent hover:underline mt-1"
                      >
                        Mở công việc <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="h-5 w-5 shrink-0 rounded hover:bg-line text-muted hover:text-foreground flex items-center justify-center cursor-pointer"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
