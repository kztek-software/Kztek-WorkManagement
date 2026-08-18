---
step: 1.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 14:05
deps: []
---

# STEP 1.1 — Database Migration bảng Attachment & Types

## Input nhận
Prisma schema với model `Attachment` mới cập nhật.

## Nhiệm vụ
1. Viết script `scripts/migrate-attachments.js` sử dụng `better-sqlite3` để tạo bảng `Attachment` và các indexes liên quan (`taskId`, `ticketId`, `uploaderId`) trong `prisma/dev.db`.
2. Khai báo kiểu dữ liệu `AttachmentDto` trong `src/lib/types.ts` và bổ sung quan hệ `attachments` vào `TaskDto` và `CustomerTicketDto`.

## Definition of Done
- [x] Bảng `Attachment` được tạo thành công trong SQLite.
- [x] `AttachmentDto` được export đầy đủ và đồng bộ.

