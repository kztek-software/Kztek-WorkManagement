---
step: 1.1
plan: PLAN-customer-ticket-badge-contrast-2026-08-20
agent: Junior Developer
status: done
completed: 2026-08-20 14:34
---

# STEP-1.1: Cập nhật CSS/Tailwind classes độ tương phản cao cho `ticket-list-view.tsx` & `ticket-drawer.tsx`

## Kết quả thực hiện
- Sửa badge "Chờ điều phối" trong bảng `TicketListView` (`src/components/tickets/ticket-list-view.tsx`):
  - Áp dụng `bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/50 dark:border-amber-500/40`
  - Icon `AlertTriangle`: `text-amber-700 dark:text-amber-400`
- Sửa tab bộ lọc "Chờ Admin Điều Phối" (`TicketListView`):
  - Active text: `text-amber-700 dark:text-amber-400`, border: `border-amber-500`
  - Hover text: `hover:text-amber-700 dark:hover:text-amber-300`
  - Counter badge: `bg-amber-500/15 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/50 dark:border-amber-500/30`
- Đồng bộ badge "Chờ điều phối" trong `TicketDrawer` (`src/components/tickets/ticket-drawer.tsx`).
- Kiểm tra type check: `npx tsc --noEmit` exit 0 (0 error).

## Handoff Log
- Đã hoàn tất sửa CSS/Tailwind class cho các vị trí hiển thị badge và filter tab unassigned tickets. Chuyển sang Tech Lead & UX/UI Review.
