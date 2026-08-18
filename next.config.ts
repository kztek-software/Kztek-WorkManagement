import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
