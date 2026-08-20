---
step: 1.1
title: Tinh chỉnh giao diện thẻ task gọn gàng & loại bỏ khoảng trống thừa
agent: junior-developer
status: done
completed_at: 2026-08-20 14:28
---

# STEP 1.1: Tinh chỉnh giao diện thẻ task gọn gàng & loại bỏ khoảng trống thừa

## Nhiệm vụ
1. Cập nhật `src/components/board/task-card.tsx`:
   - Bỏ `min-h-[142px]` cứng và bỏ `min-h-[22px]` slot rỗng.
   - Đặt padding `p-2.5 sm:p-3`, tiêu đề `mb-1.5 line-clamp-2`.
   - Chỉ hiển thị nhãn khi có nhãn, thu gọn footer `pt-1.5 mt-1 border-t border-line/40`.

## Files đã sửa
- `src/components/board/task-card.tsx`

## Kết quả kiểm thử
- TypeScript compilation: 0 errors (Exit Code 0).
- Thẻ task đạt tỷ lệ gọn gàng, thanh thoát, không còn khoảng trống thừa.