"use client";

import React, { useEffect } from "react";

declare global {
  interface Window {
    kztekDesktop?: {
      isDesktopApp: boolean;
      platform: string;
      version: string;
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      sendNotification: (title: string, body: string, icon?: string) => void;
      setBadgeCount: (count: number) => void;
      navigate: (route: string) => void;
    };
  }
}

export function NativeNotificationBridge() {
  useEffect(() => {
    try {
      // 1. Kiểm tra môi trường Desktop App
      const isNativeDesktop = typeof window !== "undefined" && Boolean(window.kztekDesktop && window.kztekDesktop.isDesktopApp);

      // 2. Yêu cầu quyền thông báo hệ thống nếu chạy trên browser
      if (!isNativeDesktop && typeof window !== "undefined" && "Notification" in window) {
        try {
          if (Notification.permission === "default") {
            const req = Notification.requestPermission();
            if (req && typeof req.catch === "function") {
              req.catch(() => {});
            }
          }
        } catch {
          // ignore
        }
      }

      // 3. Lắng nghe custom event từ hệ thống để bắn thông báo
      const handleNotifyEvent = (e: any) => {
        try {
          const { title, body, icon } = (e && e.detail) || {};
          if (isNativeDesktop && window.kztekDesktop && typeof window.kztekDesktop.sendNotification === "function") {
            window.kztekDesktop.sendNotification(title || "KZTEK Work", body || "", icon || "/Kztek_Logo.png");
          } else if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(title || "KZTEK Work", {
                body: body || "",
                icon: icon || "/Kztek_Logo.png",
              });
            } catch {
              // ignore
            }
          }
        } catch {
          // ignore
        }
      };

      window.addEventListener("kztek-notify", handleNotifyEvent);
      return () => {
        try {
          window.removeEventListener("kztek-notify", handleNotifyEvent);
        } catch {
          // ignore
        }
      };
    } catch {
      // ignore
    }
  }, []);

  return null;
}

// Helper function có thể gọi từ bất cứ đâu trong client code
export function sendDesktopNotification(title: string, body: string, icon?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kztek-notify", {
        detail: { title, body, icon },
      })
    );
  }
}
