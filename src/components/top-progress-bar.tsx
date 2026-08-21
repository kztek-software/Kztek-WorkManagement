"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPathname = useRef(pathname);
  const safetyTimer = useRef<NodeJS.Timeout | null>(null);

  // Khi pathname thay đổi (trang mới đã tải xong) -> hoàn tất 100% ngay lập tức và biến mất
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Bắt sự kiện click vào các liên kết nội bộ
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (
        target &&
        target.href &&
        target.href.startsWith(window.location.origin) &&
        !target.hasAttribute("download") &&
        target.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        try {
          const targetUrl = new URL(target.href);
          // Chỉ kích hoạt khi đường dẫn thực sự khác trang hiện tại
          if (targetUrl.pathname !== window.location.pathname) {
            setVisible(true);
            setProgress(35);

            // Timeout an toàn: Tự động tắt sau tối đa 2 giây nếu mạng/trang đã tải xong
            if (safetyTimer.current) clearTimeout(safetyTimer.current);
            safetyTimer.current = setTimeout(() => {
              setProgress(100);
              setTimeout(() => {
                setVisible(false);
                setProgress(0);
              }, 250);
            }, 1800);
          }
        } catch {}
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  // Hiệu ứng tăng dần mượt mà khi đang tải
  useEffect(() => {
    if (!visible || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        if (prev < 60) return prev + 15;
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [visible, progress]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[3px] bg-transparent transition-opacity duration-300"
      style={{ opacity: progress === 100 ? 0 : 1 }}
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#F05922] via-[#FF8C00] to-[#FFA500] shadow-[0_0_12px_rgba(240,89,34,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
