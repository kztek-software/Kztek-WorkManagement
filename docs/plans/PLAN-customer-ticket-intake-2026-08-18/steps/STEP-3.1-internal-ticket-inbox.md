---
step: 3.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: todo
completed_at:
deps: ["1.2", "2.1"]
---

# STEP 3.1 — Giao diện Trung tâm Quản lý Ticket trong Dự án

## Input nhận
APIs nội bộ và Portal từ các bước trước.

## Nhiệm vụ
1. Thêm mục "Hộp thư Ticket / Báo lỗi KH" vào Sidebar (`src/components/app-shell.tsx`) với icon `Inbox` hoặc `LifeBuoy` và badge số lượng ticket mới.
2. Xây dựng trang `src/app/projects/[projectId]/tickets/page.tsx`:
   - Bảng thống kê nhanh (Tổng số ticket, Chờ xử lý, Đang giải quyết, Đã xử lý).
   - Bộ lọc đa năng (Trạng thái, Mức độ ưu tiên, Loại ticket, Từ khóa tìm kiếm).
   - Bảng danh sách Ticket hiện đại, hiển thị rõ Tên khách, Email, Tiêu đề, Mã tra cứu, Thời gian tạo, Badge trạng thái.
   - Drawer/Modal chi tiết Ticket: hiển thị đầy đủ thông tin khách hàng, môi trường lỗi, nội dung phản hồi, ghi chú nội bộ và form đổi trạng thái nhanh.

## Definition of Done
- [ ] Truy cập được vào `/projects/[projectId]/tickets` từ Sidebar.
- [ ] Xem danh sách, lọc, tìm kiếm và xem chi tiết ticket mượt mà.
- [ ] Cập nhật trạng thái và ghi chú nội bộ trực tiếp trên giao diện.

## Đã làm


## Artifact


## Quyết định quan trọng


## Handoff Payload — bước sau đọc phần này
- do_not_redo: Không có
- watch_out: Không có
- next_inputs: Không có

## Commit
- Hash: 
- Đã push: Không
