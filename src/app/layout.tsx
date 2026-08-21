import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { NativeNotificationBridge } from "@/components/desktop/native-notification-bridge";
import { LegacyPolyfills } from "@/components/legacy-polyfills";
import { ThemeProvider } from "@/lib/theme-context";
import { TopProgressBar } from "@/components/top-progress-bar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "KZTEK Work — Nền tảng Điều hành & Quản lý Công việc",
  description: "Hệ thống quản lý công việc, dự án, sprint và phân quyền thông minh chuẩn nội bộ KZTEK",
  manifest: "/manifest.json",
  applicationName: "KZTEK Work",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KZTEK Work",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground selection:bg-accent/30"
      >
        {/* Inline no-FOUC script: chạy đồng bộ trước khi React hydrate,
            đặt data-theme="light" nếu user đã lưu light theme trong localStorage.
            Mặc định không set → `:root` dark là baseline. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('kztek-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <TopProgressBar />
          <LegacyPolyfills />
          <NativeNotificationBridge />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
