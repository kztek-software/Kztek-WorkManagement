# STEP-2.1: Triển Khai Desktop PWA Manifest, Global Command Palette & Shortcuts Hub

## 1. Nội dung đã thực hiện
- **Desktop PWA Manifest (`public/manifest.json`)**:
  - Khai báo đầy đủ metadata ứng dụng độc lập trên máy tính (display: `standalone`, theme color: `#251C53`, background: `#251C53`).
  - Định nghĩa các desktop quick shortcuts: "Desktop Workstation (`/desktop`)", "Kanban Board (`/`)", "Customer Tickets (`/portal`)".
  - Cập nhật `src/app/layout.tsx` với link manifest và appleWebApp metadata.
- **Shortcuts Modal (`src/components/desktop/shortcuts-modal.tsx`)**:
  - Hộp thoại tra cứu đầy đủ phím tắt máy tính theo 3 nhóm: Điều hướng & Tìm kiếm, Tiện ích & Máy tính năng suất, Thao tác nhanh & Điều hướng trang.
- **Global Command Palette (`src/components/desktop/command-palette.tsx`)**:
  - Phím tắt kích hoạt `Ctrl + K` / `Cmd + K`.
  - Hỗ trợ tìm kiếm mờ (fuzzy filter) trên hành động nhanh, dự án, tickets và điều hướng.
  - Hỗ trợ điều hướng bàn phím `ArrowUp`, `ArrowDown`, `Enter` và `Escape`.

## 2. Handoff Log
- **Người bàn giao**: Senior Developer (L4)
- **Người nhận bàn giao**: Senior Developer (L4) tiếp tục Bước 2.2
- **Nội dung bàn giao**: Đã sẵn sàng các thành phần cốt lõi của Desktop Shell, tiếp tục xây dựng giao diện Desktop Workstation Portal `/desktop`, Dual-Pane Split View và System Status Bar.
