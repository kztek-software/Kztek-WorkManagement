---
step: 1.1
title: Đồng bộ chiều cao thẻ task & bổ sung margin phải cột hoàn thành
agent: junior-developer
status: done
completed_at: 2026-08-20 13:50
---

# STEP 1.1: Đồng bộ chiều cao thẻ task & bổ sung margin phải cột hoàn thành

## Nhiệm vụ
1. Cập nhật `src/components/board/task-card.tsx`:
   - Đặt container thẻ task: `flex flex-col justify-between min-h-[120px] sm:min-h-[124px]`.
   - Đặt tiêu đề task: `min-h-[36px] line-clamp-2 leading-snug`.
   - Đặt chân trang: `mt-auto pt-2 border-t border-line/50`.
2. Cập nhật `src/app/projects/[projectId]/board/page.tsx`:
   - Thêm `pr-6 sm:pr-8 md:pr-10` cho board scroll container.
   - Thêm spacer element `<div className="w-2 sm:w-4 md:w-6 shrink-0" aria-hidden="true" />` ở cuối danh sách cột.

## Files đã sửa
- `src/components/board/task-card.tsx`
- `src/app/projects/[projectId]/board/page.tsx`

## Handoff Log
- Đã hoàn tất đồng bộ chiều cao và bổ sung margin phải. Bàn giao sang Tech Lead & UX/UI Reviewer.