---
step: 1.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 13:46
deps: ["1.1"]
---

# STEP 1.2 — Xây dựng REST API Public & Internal Ticket Management

## Input nhận
Schema Prisma từ STEP 1.1 và module `src/lib/tickets.ts` đã sẵn sàng.

## Nhiệm vụ
Phát triển các API routes:
1. `POST /api/tickets/public`: Tiếp nhận ticket từ khách hàng (hỗ trợ theo projectKey hoặc projectId), sinh tracking code duy nhất ngẫu nhiên dễ đọc `TK-YYYYMMDD-XXXX`.
2. `GET /api/tickets/[code]`: Tra cứu thông tin ticket công khai theo mã tracking code (loại trừ thông tin nhạy cảm/ghi chú nội bộ).
3. `POST /api/tickets/[code]/comments`: Cho phép khách hàng hoặc nhân viên thêm phản hồi vào ticket.
4. `GET /api/projects/[projectId]/tickets`: Lấy danh sách ticket cho thành viên dự án, hỗ trợ filter trạng thái, ưu tiên, tìm kiếm.
5. `PATCH /api/projects/[projectId]/tickets/[ticketId]`: Cập nhật trạng thái (OPEN, IN_PROGRESS, RESOLVED, CLOSED...), gán người phụ trách, ghi chú nội bộ/giải quyết.
6. `POST /api/projects/[projectId]/tickets/[ticketId]/convert`: Chuyển đổi Ticket thành Task/Bug trên Kanban Board.

## Definition of Done
- [x] API công khai tạo và tra cứu ticket hoạt động chính xác kèm validation (Zod).
- [x] API nội bộ có xác thực phân quyền qua `requireUser` và `projectMember`.
- [x] Phát sự kiện `publish(projectId, { type: "TICKET_CREATED", ... })` khi có ticket mới.
- [x] API convert ticket sang task hoạt động chuẩn xác, tự tạo nhãn "Báo lỗi KH".

## Đã làm
- Tạo `src/app/api/tickets/public/route.ts` (GET danh sách project, POST nhận ticket).
- Tạo `src/app/api/tickets/[code]/route.ts` (GET tra cứu công khai theo tracking code).
- Tạo `src/app/api/tickets/[code]/comments/route.ts` (POST thêm comment tương tác).
- Tạo `src/app/api/projects/[projectId]/tickets/route.ts` (GET danh sách có filter/stats & POST tạo nội bộ).
- Tạo `src/app/api/projects/[projectId]/tickets/[ticketId]/route.ts` (GET chi tiết & PATCH cập nhật).
- Tạo `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts` (POST chuyển đổi sang Task/Bug).

## Artifact
- `src/app/api/tickets/public/route.ts`
- `src/app/api/tickets/[code]/route.ts`
- `src/app/api/tickets/[code]/comments/route.ts`
- `src/app/api/projects/[projectId]/tickets/route.ts`
- `src/app/api/projects/[projectId]/tickets/[ticketId]/route.ts`
- `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts`

## Quyết định quan trọng
- Khi convert ticket sang task, hệ thống tự động sinh nhãn `Báo lỗi KH` màu hồng đậm (`#f43f5e`) và liên kết 2 chiều giữa Task và Ticket.

## Handoff Payload — bước sau đọc phần này
- do_not_redo: Toàn bộ REST APIs đã hoàn tất và sẵn sàng kết nối giao diện.
- watch_out: Frontend public portal chỉ cần gọi `/api/tickets/public` để lấy danh sách dự án và gửi form; tra cứu gọi `/api/tickets/${trackingCode}`.
- next_inputs: Dùng các endpoints này để xây dựng Public Portal ở STEP 2.1 và Internal Inbox ở STEP 3.1.

## Commit
- Hash: local-step-1.2
- Đã push: Không

