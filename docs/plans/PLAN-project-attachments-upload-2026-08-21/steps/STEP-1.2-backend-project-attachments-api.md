---
step: 1.2
title: Nâng cấp Backend APIs cho Project Attachments
agent: senior-developer
status: pending
---

# STEP 1.2: Nâng cấp Backend APIs

## Mục tiêu
1. Cập nhật `src/app/api/attachments/route.ts`: cho phép truyền `projectId`.
2. Cập nhật `src/app/api/projects/route.ts`: khi `POST /api/projects` nhận danh sách `attachments`, tạo kèm các bản ghi `Attachment` liên kết với `projectId`.
3. Cập nhật `src/app/api/projects/[projectId]/route.ts`: `GET` và `PATCH` hỗ trợ bao gồm `attachments` và quản lý attachments của dự án.
4. Tạo API route chuyên biệt `src/app/api/projects/[projectId]/attachments/route.ts` hỗ trợ upload và lấy danh sách attachments dự án.
5. Cập nhật `src/app/api/projects/[projectId]/dashboard/route.ts` để nạp danh sách `attachments` của dự án.

## Handoff Log
- Chờ Bước 1.1 hoàn thành.
