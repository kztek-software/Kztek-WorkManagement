---
step: 3.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 16:46
deps: ["2.1"]
---

# STEP 3.1 — Xây dựng API Điều phối Ticket tới Dự án cụ thể

## Nhiệm vụ
- Xây dựng API route `PATCH /api/tickets/[ticketId]/dispatch`:
  - Kiểm tra quyền: Chỉ `role === "ADMIN"` hoặc Project Manager mới được quyền điều phối.
  - Cập nhật `ticket.projectId = targetProjectId`, `ticket.status = "TRIAGED"`.
  - Ghi chú nội bộ log điều phối.
  - Gửi thông báo cho các thành viên trong dự án đích (Tech Lead, PM).
  - Bắn SSE event để cập nhật realtime bảng Ticket của dự án đích.

## Definition of Done
- [x] API Điều phối hoạt động chính xác và gán ticket sang dự án đích.
- [x] Tự động gửi thông báo cho các thành viên của dự án được điều phối.

