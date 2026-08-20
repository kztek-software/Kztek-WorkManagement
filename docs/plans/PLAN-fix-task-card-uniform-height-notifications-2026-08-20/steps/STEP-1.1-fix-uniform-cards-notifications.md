---
step: 1.1
title: Đồng bộ kích thước thẻ task & gỡ chặn thông báo/email khi gán việc
agent: junior-developer
status: done
completed_at: 2026-08-20 14:02
---

# STEP 1.1: Đồng bộ kích thước thẻ task & gỡ chặn thông báo/email khi gán việc

## Nhiệm vụ
1. Chuẩn hóa `src/components/board/task-card.tsx`:
   - Đặt chiều cao `min-h-[142px]` cho toàn bộ thẻ task.
   - Title slot cố định `min-h-[38px] line-clamp-2`.
   - Label slot cố định `min-h-[22px] flex items-center`.
   - Footer ghim đáy `mt-auto pt-2 border-t border-line/50`.
2. Sửa `src/app/api/projects/[projectId]/tasks/[taskId]/route.ts` & `tasks/route.ts`:
   - Gỡ bỏ `d.assigneeId !== user.id` để luôn gọi `notifyTaskAssigned` khi gán người thực hiện.
3. Sửa `src/lib/notifications.ts`:
   - Gỡ bỏ `params.assigneeId === params.actorId` trong `notifyTaskAssigned`, hỗ trợ tạo thông báo và gửi email cho cả trường hợp tự nhận việc và được giao việc.

## Files đã sửa
- `src/components/board/task-card.tsx`
- `src/components/board/board-column.tsx`
- `src/lib/notifications.ts`
- `src/app/api/projects/[projectId]/tasks/[taskId]/route.ts`
- `src/app/api/projects/[projectId]/tasks/route.ts`

## Kết quả kiểm thử
- Chạy `test-assignment-notifications.ts`: In-app notification tạo thành công vào CSDL, Email HTML gửi thành công qua SMTP.
- TypeScript compilation: 0 errors (Exit Code 0).