# STEP-2.4: Tích Hợp Native Notification Bridge Vào Root Layout

## 1. Nội dung đã thực hiện
- **Cập nhật `src/app/layout.tsx`**:
  - Nhúng component `<NativeNotificationBridge />` vào cấp root để lắng nghe toàn bộ thông báo của ứng dụng.
  - Tự động kích hoạt thông báo Toast của Windows khi có sự kiện `kztek-notify`.

## 2. Handoff Log
- **Người bàn giao**: Junior Developer (L5)
- **Người nhận bàn giao**: UX/UI Reviewer (L5) tiếp tục Bước 3.1
- **Nội dung bàn giao**: Toàn bộ tính năng Native Desktop Standalone App đã hoàn thành tích hợp. Bắt đầu đánh giá trải nghiệm theo 7 tiêu chí C1–C7.
