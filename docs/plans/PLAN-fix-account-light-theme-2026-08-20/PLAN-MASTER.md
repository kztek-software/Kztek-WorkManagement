---
task: fix-account-light-theme
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Sửa Ô Account & Các Dropdown Chưa Có Light Theme

## 1. Mô tả
Giao diện ô Account (User Profile Flyout Dropdown), Menu Dự án (Project Switcher Dropdown), và các popover trạng thái đang bị gán cứng nền tối (`bg-[#131826]`, `border-white/15`, `ring-black/50`). Khi chuyển sang Chế độ sáng (Light theme `[data-theme="light"]`), các chữ màu tối (`text-foreground` là `#251C53`, `text-muted` là `#6B6485`) bị chìm trên nền tối `#131826`, gây lỗi tương phản và không đồng bộ theme.

## 2. Root Cause Analysis
- Menu tài khoản người dùng tại `src/components/app-shell.tsx` (dòng 937) sử dụng class cố định `bg-[#131826]` và `border-white/15`.
- Menu chuyển đổi dự án `src/components/app-shell.tsx` (dòng 559), mobile drawer (dòng 797), mobile bottom nav (dòng 999) cũng dùng màu hex tối cố định.
- Popover trạng thái dự án tại `src/app/projects/[projectId]/dashboard/page.tsx` và `all-projects/page.tsx` tương tự dùng `bg-[#131826]`.
- Giải pháp: Chuyển toàn bộ sang các biến Tailwind động của hệ thống design system (`bg-surface`, `bg-surface-2`, `bg-surface-3`, `border-line`, `ring-line`), tự động phản chiếu màu sắc theo `[data-theme="light"]` và dark theme chuẩn KZTEK.

## 3. Workflow: WF-FASTTRACK (P3)
1. **Junior Developer (L5)**: Chỉnh sửa các class màu sắc sang CSS theme tokens trong `app-shell.tsx`, `dashboard/page.tsx`, `all-projects/page.tsx`, `tooltip.tsx`.
2. **Tech Lead (L3)**: Review kiểm tra tính nhất quán với Design System KZTEK.
3. **UX/UI Reviewer (L5)**: Đánh giá trực quan giao diện Light/Dark theo 7 tiêu chuẩn (C1–C7).
4. **QA Engineer (L5)**: Smoke test xác thực hiển thị và tương tác người dùng.
5. **DevOps Engineer (L5)**: Kiểm tra build & hoàn tất triển khai.

## 4. Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Chuyển đổi mã màu Account dropdown & popovers sang CSS tokens | Junior Developer | ✅ | 2026-08-20 11:52 |
| 1.2 | Review chất lượng code & theme consistency | Tech Lead | ✅ | 2026-08-20 11:53 |
| 1.3 | Đánh giá trực quan giao diện Light & Dark (C1-C7) | UX/UI Reviewer | ✅ | 2026-08-20 11:53 |
| 1.4 | Smoke test & Verification | QA Engineer | ✅ | 2026-08-20 11:53 |
| 1.5 | Build check & Hoàn tất | DevOps Engineer | ✅ | 2026-08-20 11:54 |
