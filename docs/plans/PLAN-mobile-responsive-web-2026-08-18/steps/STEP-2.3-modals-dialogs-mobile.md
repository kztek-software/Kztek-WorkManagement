---
step: 2.3
name: modals-dialogs-mobile
agent: junior-developer
status: done
---

# STEP 2.3: Tối Ưu Dialogs, Modals & Forms Trên Thiết Bị Di Động

## Mục tiêu
Tối ưu hóa các Dialog/Modal (`src/components/ui/dialog.tsx`, `task-dialog.tsx`, `new-task-dialog.tsx`, `sprint-detail-dialog.tsx`, `member-dialog.tsx`, `notion-dialog.tsx`).

## Danh sách công việc
1. `dialog.tsx`: Cập nhật `DialogContent` hỗ trợ `w-[95vw] sm:max-w-2xl max-h-[90vh] p-4 sm:p-6 overflow-y-auto`.
2. `task-dialog.tsx`: Chuyển đổi grid 2 cột `grid-cols-[1fr_260px]` sang responsive `grid-cols-1 lg:grid-cols-[1fr_260px] divide-y lg:divide-y-0 lg:divide-x`.
3. `new-task-dialog.tsx`: Form tạo task 1 cột trên mobile.
4. `sprint-detail-dialog.tsx` & `member-dialog.tsx`: Đảm bảo không bị tràn ngang trên màn hình điện thoại.
