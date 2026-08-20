---
task: desktop-web-app
created: 2026-08-18
updated: 2026-08-18
status: completed
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Giai đoạn 4 (GD4) — Ứng Dụng Máy Tính Dạng Web App (Desktop Web Workstation)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mục tiêu
Nâng tầm trải nghiệm người dùng máy tính (Desktop/Laptop PC) cho hệ thống KZTEK Work Management:
1. **Trang Làm Việc Máy Tính Chuyên Dụng (Desktop Workstation Portal - `/desktop`)**:
   - Giao diện tối ưu hóa toàn diện cho màn hình máy tính lớn (Full HD, 2K, 4K, Ultrawide).
   - Khung làm việc chia đôi (Multi-Pane / Split View): Cho phép mở đồng thời 2 khung nhìn làm việc (Kanban Board + Task Detail, Dashboard + Tickets, Sprint Planning + Backlog).
   - Thanh trạng thái máy tính (Desktop Status Bar & System Dock): Giám sát kết nối máy chủ, độ trễ API, đồng hồ, phím tắt nhanh, nút Fullscreen và điều khiển Theme.

2. **Hệ Thống Phím Tắt Toàn Năng & Command Palette (`Ctrl + K`)**:
   - Tìm kiếm nhanh tức thì tác vụ, dự án, tickets, người dùng chỉ bằng bàn phím.
   - Kích hoạt các hành động nhanh (Tạo Task, mở máy tính tiện ích, chuyển dự án, chuyển trạng thái).
   - Bảng tra cứu phím tắt toàn năng (`?` hoặc `Ctrl + /`).

3. **Bộ Công Cụ & Máy Tính Năng Suất (Smart Work Calculators & Productivity Hub)**:
   - Widget Máy tính Nổi (Floating Work Calculator) tích hợp trực tiếp trên Web App.
   - Máy tính ước lượng Sprint & Story Points (Sprint Velocity & Capacity Estimator).
   - Máy tính KPI & Tiến độ hoàn thành dự án.
   - Desktop Scratchpad / Ghi chú nhanh lưu trữ cục bộ.

4. **Chuẩn Hóa Ứng Dụng Máy Tính Độc Lập (Desktop PWA & Standalone Mode)**:
   - Cung cấp Web App Manifest chuẩn Desktop với desktop shortcuts, icons độ phân giải cao và chế độ chạy độc lập không viền trình duyệt.
   - Trình thông báo và nút cài đặt ứng dụng vào màn hình máy tính (Install to Desktop).

## Phân công thực hiện (Chain of Command)

| Phase | Bước | Agent | Nội dung | Status | Step file |
|---|---|---|---|---|---|
| Phase 1 | 1.1 | Product Manager & BA | Phân tích PRD & Đặc tả nghiệp vụ Ứng dụng Máy tính Web App & Smart Calculators | ✅ | `steps/STEP-1.1-prd-desktop-web-app.md` |
| Phase 1 | 1.2 | UI/UX Designer & Tech Lead | Thiết kế kiến trúc Desktop Workstation, Multi-Pane Layout, Command Palette & PWA Spec | ✅ | `steps/STEP-1.2-ux-ui-desktop-design-spec.md` |
| Phase 2 | 2.1 | Senior Developer | Triển khai Desktop PWA Manifest, Global Command Palette (`Ctrl+K`) & Keyboard Shortcuts Hub | ✅ | `steps/STEP-2.1-pwa-command-palette-shortcuts.md` |
| Phase 2 | 2.2 | Senior Developer | Xây dựng Giao diện Desktop Workstation (`/desktop`), Split-View Workspace & System Status Bar | ✅ | `steps/STEP-2.2-desktop-workstation-split-view.md` |
| Phase 2 | 2.3 | Junior Developer | Xây dựng Bộ công cụ Smart Work Calculator (Floating Calculator, Story Points & Sprint Capacity, KPI, Scratchpad) | ✅ | `steps/STEP-2.3-smart-work-calculators.md` |
| Phase 2 | 2.4 | Junior Developer | Tích hợp Điều hướng Desktop vào AppShell & Cập nhật các Component liên kết | ✅ | `steps/STEP-2.4-appshell-desktop-integration.md` |
| Phase 3 | 3.1 | UX/UI Reviewer | Đánh giá trải nghiệm màn hình máy tính theo 7 tiêu chí C1–C7 (Desktop FHD/2K, Dual-Pane, Khả năng tiếp cận phím tắt) | ✅ | `steps/STEP-3.1-ux-ui-review-desktop.md` |
| Phase 3 | 3.2 | QA Engineer & QA Lead | Chạy kịch bản kiểm thử tự động toàn diện `test-desktop-web-app-e2e.js`, kiểm nghiệm và Ký duyệt nghiệm thu (Sign-off) | ✅ | `steps/STEP-3.2-qa-verification-signoff.md` |

## Artifacts theo dõi
- `public/manifest.json` (Desktop PWA Manifest)
- `src/app/desktop/page.tsx` (Desktop Workstation Portal)
- `src/components/desktop/command-palette.tsx` (Command Palette `Ctrl+K`)
- `src/components/desktop/shortcuts-modal.tsx` (Shortcuts Help)
- `src/components/desktop/desktop-split-view.tsx` (Dual-Pane Multi-View)
- `src/components/desktop/desktop-status-bar.tsx` (System Status Bar & Dock)
- `src/components/desktop/smart-work-calculator.tsx` (Floating Work Calculator & Sprint Estimator)
- `src/components/desktop/desktop-scratchpad.tsx` (Quick Notes)
- `scripts/test-desktop-web-app-e2e.js` (E2E Verification Script - 33/33 PASS)
- `code-graph/CODE-GRAPH.md`
