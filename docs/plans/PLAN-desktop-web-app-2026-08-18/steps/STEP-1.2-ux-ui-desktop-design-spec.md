# STEP-1.2: Thiết Kế Giao Diện & Kiến Trúc Kỹ Thuật Desktop Workstation

## 1. Bản Vẽ & Thiết Kế Kiến Trúc UI/UX Desktop (1920x1080 / 2K / 4K)

### 1.1 Nguyên Tắc Thiết Kế Trải Nghiệm Máy Tính (Desktop-First Principles)
1. **Tận dụng tối đa không gian màn hình rộng (Information Density & Panoramic Views)**:
   - Thay vì hiển thị khoảng trắng lãng phí ở 2 bên màn hình như giao diện web thông thường, Desktop Workstation `/desktop` mở rộng 100% viewport width và height (`h-screen overflow-hidden`).
2. **Đa nhiệm song song (Multi-Tasking with Dual-Pane Split View)**:
   - Panel Trái (Primary View): Mặc định là Kanban Board hoặc Sprint Backlog.
   - Panel Phải (Secondary/Inspector View): Hiển thị Chi tiết Công việc (Task Detail & Checklist), Tickets Khách Hàng, Tài liệu Notion, hoặc Báo cáo Tiến độ.
   - Thanh chia tỷ lệ (Draggable/Preset Splitter): Nút chuyển nhanh tỷ lệ 50/50, 60/40, 70/30, hoặc Maximize 1 Panel.
3. **Thanh Trạng Thái Máy Tính (Desktop System Status Bar & Dock)**:
   - Nằm cố định ở đáy màn hình với chiều cao chuẩn 28px - 32px (giống VS Code / macOS Dock).
   - Chứa các widget:
     - `Live Connection Indicator`: Đèn xanh báo hiệu kết nối API backend & số ping latency (VD: `● Online (18ms)`).
     - `Active Workspace Info`: Tên dự án đang làm việc và sprint hiện tại.
     - `Shortcuts Cheat Sheet Button`: Nút bấm `[?] Phím tắt` hoặc `Ctrl + /`.
     - `Floating Calculator Button`: Nút bật/tắt widget máy tính nổi (`Alt + C`).
     - `Scratchpad Button`: Nút mở ghi chú nhanh (`Alt + S`).
     - `Fullscreen Toggle`: Phím tắt F11 / nút phóng to toàn màn hình.

---

## 2. Đặc Tả Thiết Kế Command Palette & Phím Tắt

### 2.1 Layout Command Palette Modal (`Ctrl + K`)
- Modal định vị căn giữa phía trên màn hình (`top-20`), hiệu ứng bóng mờ `backdrop-blur-md`, nền tối sang trọng `#181236` kết hợp viền sáng tinh tế `#3A2E75`.
- Thanh tìm kiếm lớn có icon Kính lúp, placeholder: *"Tìm kiếm công việc, dự án, tickets hoặc gõ lệnh... (Esc để đóng)"*.
- Danh sách kết quả phân nhóm trực quan:
  - ⚡ **Hành động nhanh (Quick Actions)**: Tạo công việc mới, Mở máy tính, Xem phím tắt, Đổi dự án, Xuất báo cáo.
  - 📋 **Công việc gần đây (Tasks)**: Tìm kiếm theo mã và tiêu đề công việc.
  - 🎫 **Phiếu hỗ trợ (Tickets)**: Tra cứu nhanh ticket theo mã tracking hoặc tiêu đề lỗi.
  - 📁 **Dự án (Projects)**: Chuyển đổi không gian dự án tức thì.
  - 🧭 **Điều hướng (Navigation)**: Đi đến Dashboard, Kanban, Sprints, Báo cáo, Phân quyền.

### 2.2 Ma Trận Phím Tắt Máy Tính (Desktop Keyboard Shortcuts)
| Phím Tắt | Hành Động | Phạm Vi |
|---|---|---|
| `Ctrl + K` / `Cmd + K` | Mở Global Command Palette | Toàn ứng dụng |
| `?` hoặc `Ctrl + /` | Mở Bảng hướng dẫn phím tắt | Toàn ứng dụng |
| `Alt + C` | Bật/Tắt Widget Máy Tính Nổi | Toàn ứng dụng / Desktop |
| `Alt + S` | Bật/Tắt Widget Ghi chú nhanh (Scratchpad) | Toàn ứng dụng / Desktop |
| `C` | Mở Dialog Tạo Task Mới (khi không focus vào input) | Toàn ứng dụng |
| `Alt + 1` | Chuyển đến Bảng Kanban | Desktop / Projects |
| `Alt + 2` | Chuyển đến Dashboard KPI | Desktop / Projects |
| `Alt + 3` | Chuyển đến Quản lý Sprints | Desktop / Projects |
| `Alt + 4` | Chuyển đến Phiếu hỗ trợ Khách hàng | Desktop / Projects |
| `Alt + 5` | Chuyển sang Chế độ Máy Tính Chuyên Dụng (`/desktop`) | Toàn ứng dụng |
| `Esc` | Đóng Modal, Palette hoặc Thu gọn Widget | Toàn ứng dụng |

---

## 3. Kiến Trúc Kỹ Thuật Component & State Management

```
src/
├── app/
│   ├── desktop/
│   │   └── page.tsx                 ← Desktop Workstation Container (Full-bleed viewport)
│   ├── layout.tsx                   ← Cập nhật PWA Meta & Desktop App Shell Providers
│   └── globals.css                  ← Thêm utilities cho Desktop Split View & Keybindings
├── components/
│   └── desktop/
│       ├── command-palette.tsx       ← Hộp thoại Command Palette thông minh (Ctrl+K)
│       ├── shortcuts-modal.tsx       ← Bảng tra cứu phím tắt toàn năng
│       ├── desktop-split-view.tsx    ← Khung làm việc chia đôi Dual-Pane có thể tùy biến
│       ├── desktop-status-bar.tsx    ← Thanh trạng thái máy tính (System Dock & Metrics)
│       ├── smart-work-calculator.tsx ← Widget Máy tính nổi (Standard Calc + Story Points + KPI)
│       └── desktop-scratchpad.tsx    ← Widget Ghi chú nhanh với LocalStorage sync
public/
└── manifest.json                    ← Web App Manifest chuẩn Desktop Standalone PWA
```

---

## 4. Handoff Log
- **Người bàn giao**: UI/UX Designer & Tech Lead (L4/L3)
- **Người nhận bàn giao**: Senior Developer & Junior Developer (L4/L5)
- **Nội dung bàn giao**: Bản thiết kế chi tiết các view, component tokens, sơ đồ component và ma trận phím tắt cho Desktop Web App.
