---
step: 3.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 16:48
deps: ["3.1"]
---

# STEP 3.2 — Tích hợp Giao diện Điều phối Dự án trong TicketDrawer & TicketListView

## Nhiệm vụ
- Cập nhật `TicketDrawer` (`src/components/tickets/ticket-drawer.tsx`):
  - Hiển thị thông tin dự án hiện tại hoặc badge "Chưa điều phối dự án".
  - Thêm nút/khu vực "Điều phối dự án (Admin)": Modal chọn dự án đích từ danh sách, bấm xác nhận điều phối.
- Cập nhật `TicketListView` (`src/components/tickets/ticket-list-view.tsx`):
  - Thêm bộ lọc / Tab "Chờ điều phối (Unassigned)" cho Admin.
  - Cho phép Admin xem các ticket từ khách hàng chưa gán dự án và thực hiện điều phối nhanh.

## Definition of Done
- [x] TicketDrawer cho phép Admin bấm Điều phối dự án trong 1-Click.
- [x] TicketListView có tab Chờ điều phối và hiển thị cột dự án trực quan.

