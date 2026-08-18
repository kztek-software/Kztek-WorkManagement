---
step: 1.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 13:45
deps: []
---

# STEP 1.1 — Thiết kế Prisma Schema: Model CustomerTicket & TicketComment

## Input nhận
Yêu cầu lưu trữ thông tin ticket từ khách hàng bên ngoài (Tên, Email, SĐT, Công ty, Tiêu đề, Mô tả, Mức độ ưu tiên, Loại lỗi, Môi trường/Thiết bị, Mã tra cứu trackingCode, Trạng thái xử lý, Quan hệ với Project và Task khi chuyển đổi, và Bảng trao đổi bình luận TicketComment).

## Nhiệm vụ
Cập nhật `prisma/schema.prisma` thêm các model `CustomerTicket` và `TicketComment`, thiết lập quan hệ với `Project`, `Task`, `User`. Chạy migration và cập nhật kiểu dữ liệu TypeScript trong `src/lib/types.ts`.

## Definition of Done
- [x] Schema Prisma được cập nhật đầy đủ các trường cần thiết cho Customer Ticket.
- [x] Database SQLite được cập nhật bảng `CustomerTicket` và `TicketComment` thành công.
- [x] Types TypeScript được xuất khẩu chuẩn trong `src/lib/types.ts` và module helper `src/lib/tickets.ts` được tạo.

## Đã làm
- Cập nhật `prisma/schema.prisma` với 2 model `CustomerTicket` và `TicketComment` kèm quan hệ với `Project` và `Task`.
- Chạy script `scripts/migrate-tickets.js` tạo cấu trúc bảng và chỉ mục unique trong SQLite `prisma/dev.db`.
- Thêm `CustomerTicketDto`, `TicketCommentDto` vào `src/lib/types.ts` và tạo `src/lib/tickets.ts` với đầy đủ CRUD, tracking code generator và bảo vệ thông tin nội bộ.

## Artifact
- `prisma/schema.prisma`
- `src/lib/types.ts`
- `src/lib/tickets.ts`
- `scripts/migrate-tickets.js`

## Quyết định quan trọng
- Dùng `src/lib/tickets.ts` kết hợp `better-sqlite3` với chế độ WAL để tối ưu truy vấn đồng thời và đảm bảo an toàn dữ liệu trên SQLite.

## Handoff Payload — bước sau đọc phần này
- do_not_redo: Đã tạo bảng CustomerTicket và TicketComment trong DB, không cần tạo lại.
- watch_out: Khi trả dữ liệu public ra ngoài qua API tracking code, `includeInternal` phải là `false` để không lộ `internalNotes` và comment nội bộ.
- next_inputs: Dùng các hàm trong `src/lib/tickets.ts` cho các API routes ở STEP 1.2.

## Commit
- Hash: local-step-1.1
- Đã push: Không

