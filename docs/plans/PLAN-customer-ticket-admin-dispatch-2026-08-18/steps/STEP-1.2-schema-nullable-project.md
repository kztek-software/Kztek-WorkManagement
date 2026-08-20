---
step: 1.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 16:45
deps: ["1.1"]
---

# STEP 1.2 — Cập nhật Schema CustomerTicket.projectId sang Nullable

## Nhiệm vụ
- Cập nhật `prisma/schema.prisma`:
  - `projectId String?` (nullable trong CustomerTicket)
  - `project Project? @relation(fields: [projectId], references: [id], onDelete: SetNull)`
- Viết và chạy script `scripts/migrate-nullable-project-ticket.js`.
- Cập nhật `CustomerTicketDto` trong `src/lib/types.ts` để `projectId?: string | null`.
- Cập nhật `src/lib/tickets.ts` để hỗ trợ `projectId: string | null`.

## Definition of Done
- [x] Schema CustomerTicket trong SQLite hỗ trợ projectId = NULL.
- [x] Các hàm CRUD trong tickets.ts hỗ trợ ticket không có dự án.

