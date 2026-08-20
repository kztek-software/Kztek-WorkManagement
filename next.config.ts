import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Đóng gói standalone (chỉ copy file cần thiết + node_modules tối giản) để build Docker image nhẹ
  output: "standalone",

  // Ẩn dev indicator badge (nút tròn N) để không che khuất bottom navigation trên mobile
  devIndicators: false,

  // Cho phép kết nối WebSocket HMR và truy cập từ mọi máy trong mạng nội bộ (LAN / Wi-Fi)
  allowedDevOrigins: [
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "192.168.0.100",
    "192.168.0.100:3000",
    "192.168.21.28",
    "192.168.21.28:3000",
    "192.168.21.35",
    "192.168.21.35:3000",
    "*.local",
    "*.lan",
  ],
};

export default nextConfig;
