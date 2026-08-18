---
step: 1.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 13:54
deps: [1.1]
---

# STEP 1.2 — Nâng cấp Notify Service (`src/lib/notifications.ts`)

## Input nhận
Email Service từ STEP 1.1 và luồng notification hiện tại.

## Nhiệm vụ
Cập nhật `src/lib/notifications.ts` đồng bộ 3 kênh truyền tải thông tin:
1. In-App Notification (Database table `Notification`)
2. Server-Sent Events (SSE `publish(projectId, ...)`)
3. Email Notification qua `src/lib/mail.ts`
Bổ sung các hàm điều phối chuyên biệt: `notifyTaskAssigned`, `notifyTaskStatusChanged`, `notifyTaskComment`.

## Definition of Done
- [x] `src/lib/notifications.ts` gọi `sendTaskAssignedEmail` khi có sự kiện `ASSIGNED`.
- [x] Không gửi email/notification cho chính người thực hiện thao tác.
- [x] Gửi bất đồng bộ không làm chậm thời gian phản hồi của API.

## Đã làm
- Bổ sung các hàm `notifyTaskAssigned`, `notifyTaskStatusChanged`, `notifyTaskComment`.
- Tự động lấy thông tin người nhận, người giao việc, tiêu đề task, hạn chót và gửi email đa kênh.

## Artifact
- `src/lib/notifications.ts`
