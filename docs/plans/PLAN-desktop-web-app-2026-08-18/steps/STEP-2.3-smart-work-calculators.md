# STEP-2.3: Xây Dựng Bộ Công Cụ Smart Work Calculator & Desktop Scratchpad

## 1. Nội dung đã thực hiện
- **Smart Work Calculator (`src/components/desktop/smart-work-calculator.tsx`)**:
  - **Tab 1: Máy tính Số Học Văn Phòng (Standard Office Calculator)**: Hỗ trợ đầy đủ phép tính cộng, trừ, nhân, chia, phần trăm, căn bậc hai, đổi dấu $\pm$, lưu lịch sử 5 phép tính gần nhất và hỗ trợ bấm bàn phím số thực tế.
  - **Tab 2: Ước lượng Sprint & Story Points (Sprint Capacity & Fibonacci Scale)**: Tính toán tự động tổng giờ năng lực (Net Capacity Hours) dựa trên số dev/QA, số ngày sprint, hệ số tập trung (Focus Factor), ước tính số Story Points tối đa cam kết và hiển thị bảng tra cứu thang điểm Fibonacci (1, 2, 3, 5, 8, 13, 21).
  - **Tab 3: Tiến Độ & KPI Dự Án (KPI & Progress Metrics)**: Tính toán Burn rate (%), tốc độ cần đạt (tasks/ngày), ước tính ngân sách nhân sự sprint theo Man-day Rate.
- **Desktop Scratchpad (`src/components/desktop/desktop-scratchpad.tsx`)**:
  - Widget ghi chú nhanh ghim trên màn hình máy tính.
  - Tự động lưu tức thì vào `localStorage`.
  - Hỗ trợ sao chép nhanh vào clipboard, xóa nội dung, đếm số dòng và số ký tự.
  - Phím tắt kích hoạt nhanh `Alt + S`.

## 2. Handoff Log
- **Người bàn giao**: Junior Developer (L5)
- **Người nhận bàn giao**: Junior Developer (L5) tiếp tục Bước 2.4
- **Nội dung bàn giao**: Bộ công cụ tính toán và ghi chú đã hoàn tất. Tiếp tục tích hợp điều hướng Desktop vào `AppShell` và các component liên kết.
