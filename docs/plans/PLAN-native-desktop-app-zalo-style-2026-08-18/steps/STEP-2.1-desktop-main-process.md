# STEP-2.1: Xây Dựng Desktop Main Process & Context Bridge

## 1. Nội dung đã thực hiện
- **Main Process (`desktop/main.js`)**:
  - Tạo cửa sổ Standalone `BrowserWindow` với kích thước $1440 \times 900$, ẩn hoàn toàn menu trình duyệt (`autoHideMenuBar: true`).
  - Hỗ trợ cơ chế Single Instance Lock (ngăn mở nhiều instance trùng lặp).
  - Tự động bắt sự kiện đóng cửa sổ `[X]` để thu nhỏ xuống System Tray góc phải màn hình Windows (giống hệt Zalo PC).
  - Xử lý các IPC channels: `window-minimize`, `window-maximize`, `window-close`, `native-notification`, `set-badge-count`, `navigate-route`.
- **Preload Script (`desktop/preload.js`)**:
  - Phơi bày an toàn API `window.kztekDesktop` cho Client Web mà không làm rò rỉ Node.js runtime.
- **Tray Manager (`desktop/tray-manager.js`)**:
  - Quản lý icon khay hệ thống, menu ngữ cảnh chuột phải và sự kiện double-click để khôi phục ứng dụng.

## 2. Handoff Log
- **Người bàn giao**: Senior Developer (L4)
- **Người nhận bàn giao**: Senior Developer (L4) tiếp tục Bước 2.2
- **Nội dung bàn giao**: Bộ khung Desktop Application đã hoàn thành, tiếp tục xây dựng Native Notification Bridge cho Web Client.
