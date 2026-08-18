---
step: 1.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: todo
completed_at:
deps: ["1.1"]
---

# STEP 1.2 — Xây dựng REST API Public & Internal Ticket Management

## Input nhận
Schema Prisma từ STEP 1.1 đã sẵn sàng.

## Nhiệm vụ
Phát triển các API routes:
1. `POST /api/tickets/public`: Tiếp nhận ticket từ khách hàng (hỗ trợ theo projectKey hoặc projectId), sinh tracking code duy nhất ngẫu nhiên dễ đọc `TK-YYYYMMDD-XXXX`.
2. `GET /api/tickets/[code]`: Tra cứu thông tin ticket công khai theo mã tracking code (loại trừ thông tin nhạy cảm/ghi chú nội bộ).
3. `POST /api/tickets/[code]/comments`: Cho phép khách hàng hoặc nhân viên thêm phản hồi vào ticket.
4. `GET /api/projects/[projectId]/tickets`: Lấy danh sách ticket cho thành viên dự án, hỗ trợ filter trạng thái, ưu tiên, tìm kiếm.
5. `PATCH /api/projects/[projectId]/tickets/[ticketId]`: Cập nhật trạng thái (OPEN, IN_PROGRESS, RESOLVED, CLOSED...), gán người phụ trách, ghi chú nội bộ/giải quyết.

## Definition of Done
- [ ] API công khai tạo và tra cứu ticket hoạt động chính xác kèm validation (Zod).
- [ ] API nội bộ có xác thực phân quyền qua `requireUser` và `projectMember`.
- [ ] Phát sự kiện `publish(projectId, { type: "TICKET_CREATED", ... })` khi có ticket mới.

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
