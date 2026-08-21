---
step: 1.1
title: Cập nhật prisma/schema.prisma và TypeScript types
agent: senior-developer
status: in_progress
started: 2026-08-21 09:17
---

# STEP 1.1: Cập nhật prisma/schema.prisma (Project.attachments, Attachment.projectId) & đồng bộ DB MSSQL + types.ts

## Mục tiêu
1. Mở rộng model `Project`: thêm trường quan hệ `attachments Attachment[]`.
2. Mở rộng model `Attachment`: thêm trường `projectId String?`, `project Project? @relation(...)`, và index `@@index([projectId])`.
3. Chạy `prisma db push` / script cập nhật database SQL Server và `prisma generate`.
4. Cập nhật `src/lib/types.ts` bổ sung `projectId` cho `AttachmentDto`, và `attachments?: AttachmentDto[]` cho `ProjectDto` & `ProjectDashboardData`.

## Handoff Log
- Cập nhật schema.prisma
- Generate Prisma client
- Cập nhật types.ts
