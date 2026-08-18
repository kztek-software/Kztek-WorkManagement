---
step: 3.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 14:12
deps: ["2.1"]
---

# STEP 3.1 — Tích hợp Attachments vào Ticket Drawer & Tự động sao chép sang Task

## Input nhận
Upload API và Media components từ Phase 1 và 2.

## Nhiệm vụ
1. Cập nhật `TicketDrawer` (`src/components/tickets/ticket-drawer.tsx`):
   - Hiển thị danh sách ảnh/video/tài liệu khách hàng gửi.
   - Cho phép nhân viên tải thêm tài liệu phản hồi vào Ticket.
2. Cập nhật API 1-Click Convert (`/api/projects/[projectId]/tickets/[ticketId]/convert`):
   - Khi chuyển Ticket thành Task, tự động sao chép toàn bộ attachments của Ticket sang Task mới để đội ngũ dev có ngay file/video lỗi trên Kanban Board.

## Definition of Done
- [x] TicketDrawer hiển thị media gallery và cho phép kỹ sư tải thêm tệp.
- [x] Chuyển đổi 1-Click tự động sao chép đầy đủ attachments sang Kanban Task.

