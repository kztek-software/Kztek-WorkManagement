---
task: mobile-responsive-web
created: 2026-08-18
updated: 2026-08-18
status: completed
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Giai đoạn 2 (GD2) — Tối ưu Hóa Toàn Diện Web Chạy Hoàn Hảo Trên Điện Thoại (Mobile Responsive Web)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mục tiêu
Nâng cấp và tối ưu hóa toàn bộ hệ thống Web KZTEK Work Management để hoạt động mượt mà, trực quan và tiện dụng trên mọi thiết bị di động (Smartphones từ 360px - 430px, Phablets, Tablets 768px):
1. **Kiến trúc Layout Di động (AppShell & Navigation)**:
   - Sidebar trượt (Mobile Drawer) với hiệu ứng trượt mượt mà, backdrop làm mờ và nút đóng / cử chỉ chạm.
   - Header di động với nút Hamburger, avatar gọn gàng và context title co giãn linh hoạt.
   - Thanh điều hướng ngón tay cái dưới đáy màn hình (Mobile Bottom Navigation Bar / Thumb-Zone) truy cập nhanh: Dashboard, Board, Sprints, Tickets, Menu mở rộng.
   - Hỗ trợ vùng an toàn tai thỏ / thanh điều hướng máy (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`).

2. **Tối ưu hóa Kanban Board & Task Cards trên Touchscreen**:
   - Kanban Board hỗ trợ cuộn ngang mượt mà (`snap-x snap-mandatory`), hiển thị vừa vặn màn hình điện thoại.
   - Dải Tab chuyển đổi nhanh cột trạng thái trên Mobile (TODO, IN PROGRESS, REVIEW, DONE) giúp xem nhanh mà không cần cuộn xa.
   - Thẻ công việc (Task Cards) tối ưu kích thước cảm ứng (Touch Targets $\ge$ 44px), bổ sung nút thao tác nhanh (Chuyển trạng thái, xem chi tiết).
   - Thanh bộ lọc & tìm kiếm thu gọn (Collapsible Mobile Filter Bar).

3. **Tối ưu hóa Toàn bộ Modals, Dialogs & Biểu mẫu**:
   - Chuyển đổi toàn bộ Dialogs (`TaskDialog`, `NewTaskDialog`, `SprintDetailDialog`, `MemberDialog`, `NotionDialog`, v.v.) sang kích thước co giãn thông minh `w-[95vw]` hoặc Bottom Sheet trên mobile, tránh tràn màn hình.
   - Tự động chuyển các form 2 cột sang 1 cột trên màn hình nhỏ.

4. **Tối ưu hóa Các Phân Hệ Chức Năng (Dashboard, Sprints, Tickets, Users, Reports, Settings, Portal)**:
   - Dashboard: KPI cards co giãn 2 cột trên mobile, biểu đồ tự thích ứng 100% chiều rộng.
   - Users / RBAC: Hiển thị thanh Tab phân loại nhân sự/phòng ban/quyền hạn trên mobile (không bị ẩn), ma trận quyền hỗ trợ cuộn ngang mượt mà.
   - Sprints & Tickets: Danh sách thẻ hiển thị gọn gàng, nút hành động xếp tầng hợp lý.
   - Customer Portal: Tối ưu biểu mẫu gửi báo lỗi và tra cứu sự cố trên điện thoại.

## Phân công thực hiện (Chain of Command)

| Phase | Bước | Agent | Nội dung | Status | Step file |
|---|---|---|---|---|---|
| Phase 1 | 1.1 | Product Manager & BA | Phân tích yêu cầu PRD & Acceptance Criteria cho Mobile Responsive Web | ✅ | `steps/STEP-1.1-mobile-audit-prd.md` |
| Phase 1 | 1.2 | UI/UX Designer & Tech Lead | Thiết kế kiến trúc Responsive Layout, Breakpoints, Thumb Zone & Drawer Spec | ✅ | `steps/STEP-1.2-app-shell-mobile-nav.md` |
| Phase 2 | 2.1 | Senior Developer | Cải tiến AppShell: Mobile Drawer, Bottom Navigation, Header Hamburger & Safe Area | ✅ | `steps/STEP-2.1-appshell-navigation.md` |
| Phase 2 | 2.2 | Senior Developer | Tối ưu Kanban Board trên Mobile: Snap Columns, Column Switcher Tabs, Touch Actions | ✅ | `steps/STEP-2.2-kanban-board-mobile.md` |
| Phase 2 | 2.3 | Junior Developer | Tối ưu Dialogs & Modals: TaskDialog, NewTaskDialog, SprintDetail, Member, Notion | ✅ | `steps/STEP-2.3-modals-dialogs-mobile.md` |
| Phase 2 | 2.4 | Junior Developer | Tối ưu các phân hệ: Dashboard, Users/RBAC tabs, Sprints, Tickets, Reports, Settings, Portal | ✅ | `steps/STEP-2.4-pages-responsive-optimization.md` |
| Phase 3 | 3.1 | UX/UI Reviewer | Đánh giá 7 tiêu chí C1–C7 trên các kích thước màn hình điện thoại thực tế (375px, 390px, 412px, 768px) | ✅ | `steps/STEP-3.1-ux-ui-review-mobile.md` |
| Phase 3 | 3.2 | QA Engineer & QA Lead | Chạy kiểm thử tự động Mobile Layout, kiểm tra toàn bộ luồng sử dụng trên Mobile & Sign-off | ✅ | `steps/STEP-3.2-qa-verification-signoff.md` |

## Artifacts theo dõi
- `src/components/app-shell.tsx` (Mobile Drawer Sidebar, Mobile Bottom Bar, Responsive Header)
- `src/app/projects/[projectId]/board/page.tsx` & `src/components/board/` (Kanban Mobile Tabs, Responsive Column)
- `src/components/ui/dialog.tsx` & Modals (Responsive Full-width sizing & Touch scroll)
- `src/app/projects/[projectId]/users/page.tsx` (Mobile Tab switcher, Responsive DataTable)
- `src/app/projects/[projectId]/dashboard/page.tsx` (Responsive KPI Grid & Canvas)
- `src/app/projects/[projectId]/sprints/page.tsx` & `src/app/projects/[projectId]/reports/page.tsx`
- `src/app/globals.css` (Safe area insets, touch-action utilities)
- `scripts/test-mobile-responsiveness.js` (Automated verification script)
