---
step: 2.2
name: kanban-board-mobile
agent: senior-developer
status: done
---

# STEP 2.2: Tối Ưu Kanban Board Trên Mobile & Touchscreen

## Mục tiêu
Tối ưu hóa trang Kanban Board (`src/app/projects/[projectId]/board/page.tsx`, `board-column.tsx`, `task-card.tsx`) trên thiết bị di động.

## Danh sách công việc
1. Bổ sung dải Tab chọn nhanh cột trạng thái trên Mobile (`TODO`, `IN PROGRESS`, `REVIEW`, `DONE`) với số lượng task tương ứng.
2. Thêm cơ chế cuộn mượt snap (`snap-x snap-mandatory`) cho container Kanban Board và `snap-center` cho từng cột `w-[85vw] sm:w-80`.
3. Tối ưu toolbar tìm kiếm & bộ lọc: Co giãn responsive, nút icon gọn gàng.
4. Đảm bảo thẻ task card và các tương tác chạm hoạt động mượt mà.
