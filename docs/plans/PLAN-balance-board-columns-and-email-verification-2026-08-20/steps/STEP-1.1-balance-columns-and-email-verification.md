---
step: 1.1
title: Cân đối 5 cột Kanban board & xác minh gửi email đến hộp thư Gmail
agent: junior-developer
status: done
completed_at: 2026-08-20 14:10
---

# STEP 1.1: Cân đối 5 cột Kanban board & xác minh gửi email đến hộp thư Gmail

## Nhiệm vụ
1. Cập nhật `src/components/board/board-column.tsx`:
   - Đặt `className="flex w-[84vw] sm:w-auto sm:flex-1 sm:min-w-[240px] md:min-w-[260px] shrink-0 sm:shrink-0 lg:shrink flex-col h-full max-h-full rounded-2xl border border-line bg-surface/40 p-2 sm:p-2.5 backdrop-blur-sm shadow-sm transition-all overflow-hidden"`.
2. Cập nhật `src/app/projects/[projectId]/board/page.tsx`:
   - Đặt padding cân đối đối xứng: `p-2.5 sm:p-4 px-3 sm:px-4 md:px-5`.
   - Bỏ spacer lệch phải để hai bên cân đối hoàn hảo.
3. Xác minh gửi email thực tế đến `anhnv09031997@gmail.com` và `kienlangvai64@gmail.com`.

## Files đã sửa
- `src/components/board/board-column.tsx`
- `src/app/projects/[projectId]/board/page.tsx`

## Kết quả kiểm thử
- Gửi thử nghiệm thành công tới `anhnv09031997@gmail.com` qua SMTP `dooralarm.manager@gmail.com`.
- TypeScript compilation: 0 errors (Exit Code 0).