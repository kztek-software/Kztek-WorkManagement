import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chuyển dev indicator (Next.js badge) sang góc dưới bên phải để không che khuất sidebar
  devIndicators: {
    position: "bottom-right",
  },

  // Cho phép kết nối WebSocket HMR và truy cập từ mọi máy trong mạng nội bộ (LAN / Wi-Fi)
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "192.168.21.28:3000",
    "192.168.21.28",
    "*.local",
    "*.lan",
  ],
};

export default nextConfig;
