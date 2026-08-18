---
step: 3.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 13:50
deps: ["1.2", "2.1"]
---

# STEP 3.1 — Giao diện Trung tâm Quản lý Ticket trong Dự án

## Input nhận
APIs nội bộ và Portal từ các bước trước.

## Nhiệm vụ
1. Thêm mục "Hộp thư Ticket / Báo lỗi KH" vào Sidebar (`src/components/app-shell.tsx`) với icon `LifeBuoy`.
2. Xây dựng trang `src/app/projects/[projectId]/tickets/page.tsx`:
   - Bảng thống kê KPI nhanh (Tổng số ticket, Chờ xử lý, Đang giải quyết, Đã xử lý).
   - Bộ lọc đa năng (Trạng thái, Mức độ ưu tiên, Loại ticket, Từ khóa tìm kiếm).
   - Bảng danh sách Ticket hiện đại, hiển thị rõ Tên khách, Email, Tiêu đề, Mã tra cứu, Thời gian tạo, Badge trạng thái.
   - Drawer/Modal chi tiết Ticket: hiển thị đầy đủ thông tin khách hàng, môi trường lỗi, nội dung phản hồi, ghi chú nội bộ và form đổi trạng thái nhanh.

## Definition of Done
- [x] Truy cập được vào `/projects/[projectId]/tickets` từ Sidebar.
- [x] Xem danh sách, lọc, tìm kiếm và xem chi tiết ticket mượt mà.
- [x] Cập nhật trạng thái và ghi chú nội bộ trực tiếp trên giao diện.

## Đã làm
- Bổ sung `LifeBuoy` icon và mục điều hướng `Hộp Thư Ticket KH` vào `mainNav` của `src/components/app-shell.tsx`.
- Tạo component `src/components/tickets/ticket-drawer.tsx` với đầy đủ tính năng cập nhật trạng thái nhanh, chỉnh sửa ghi chú nội bộ, ghi chú kết quả giải quyết, luồng trao đổi phản hồi realtime và popup chuyển đổi 1-click sang Kanban Task.
- Tạo component `src/components/tickets/ticket-list-view.tsx` với 4 thẻ KPI thống kê, bộ lọc đa năng 4 cấp độ, bảng danh sách hiện đại và modal ghi nhận ticket nội bộ cho khách.
- Tạo Server Component `src/app/projects/[projectId]/tickets/page.tsx`.

## Artifact
- `src/components/app-shell.tsx`
- `src/components/tickets/ticket-drawer.tsx`
- `src/components/tickets/ticket-list-view.tsx`
- `src/app/projects/[projectId]/tickets/page.tsx`

## Quyết định quan trọng
- Tích hợp liên kết chéo 2 chiều giữa Customer Portal và Ticket Drawer nội bộ để kỹ sư có thể mở trực tiếp trang Portal của khách hoặc sao chép mã tracking nhanh chóng.

## Handoff Payload — bước sau đọc phần này
- do_not_redo: Giao diện Trung tâm Quản lý Ticket và Drawer đã hoàn thành.
- watch_out: Khi chuyển đổi ticket thành task, Task Card trên Board cần hiển thị badge nguồn từ Customer Ticket.
- next_inputs: Tích hợp hiển thị badge liên kết trên Kanban Board và Task Dialog ở STEP 3.2.

## Commit
- Hash: local-step-3.1
- Đã push: Không

