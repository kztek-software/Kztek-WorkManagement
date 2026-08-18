---
step: 2.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 13:55
deps: [1.2]
---

# STEP 2.1 — Tích hợp gửi thông báo & Email vào các API công việc

## Input nhận
Notify Service từ STEP 1.2.

## Nhiệm vụ
Tích hợp trigger thông báo và email vào:
1. `src/app/api/projects/[projectId]/tasks/route.ts`: Khi tạo mới task và có gán `assigneeId`.
2. `src/app/api/projects/[projectId]/tasks/[taskId]/route.ts`: Khi đổi người phụ trách (`assigneeId`) hoặc đổi trạng thái (`status`).
3. `src/app/api/projects/[projectId]/tasks/[taskId]/comments/route.ts`: Khi có bình luận mới gửi thông báo cho assignee và creator.
4. `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts`: Khi chuyển đổi ticket thành task và giao việc.

## Definition of Done
- [x] Mọi luồng giao việc và cập nhật tiến độ đều kích hoạt email và in-app notification chính xác.

## Đã làm
- Tích hợp `notifyTaskAssigned` vào POST task route và convert ticket route.
- Tích hợp `notifyTaskAssigned` và `notifyTaskStatusChanged` vào PATCH task detail route.
- Tích hợp `notifyTaskComment` vào POST comment route.

## Artifact
- `src/app/api/projects/[projectId]/tasks/route.ts`
- `src/app/api/projects/[projectId]/tasks/[taskId]/route.ts`
- `src/app/api/projects/[projectId]/tasks/[taskId]/comments/route.ts`
- `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts`
