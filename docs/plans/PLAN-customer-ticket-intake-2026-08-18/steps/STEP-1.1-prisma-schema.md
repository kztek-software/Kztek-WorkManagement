---
step: 1.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: todo
completed_at:
deps: []
---

# STEP 1.1 — Thiết kế Prisma Schema: Model CustomerTicket & TicketComment

## Input nhận
Yêu cầu lưu trữ thông tin ticket từ khách hàng bên ngoài (Tên, Email, SĐT, Công ty, Tiêu đề, Mô tả, Mức độ ưu tiên, Loại lỗi, Môi trường/Thiết bị, Mã tra cứu trackingCode, Trạng thái xử lý, Quan hệ với Project và Task khi chuyển đổi, và Bảng trao đổi bình luận TicketComment).

## Nhiệm vụ
Cập nhật `prisma/schema.prisma` thêm các model `CustomerTicket` và `TicketComment`, thiết lập quan hệ với `Project`, `Task`, `User`. Chạy `npx prisma db push` và cập nhật kiểu dữ liệu TypeScript trong `src/lib/types.ts`.

## Definition of Done
- [ ] Schema Prisma được cập nhật đầy đủ các trường cần thiết cho Customer Ticket.
- [ ] Lệnh `npx prisma db push` chạy thành công mà không làm mất dữ liệu hiện có.
- [ ] Types TypeScript được xuất khẩu chuẩn trong `src/lib/types.ts`.

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
