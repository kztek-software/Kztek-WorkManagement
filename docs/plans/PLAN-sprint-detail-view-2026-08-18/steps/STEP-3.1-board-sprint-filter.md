# STEP 3.1 — Tích hợp bộ lọc Sprint trên Board Page

## Nhiệm vụ
Cập nhật `src/app/projects/[projectId]/board/page.tsx`:
- Nhận diện query param `?sprintId=...` để tự động lọc board theo sprint nếu được chỉ định hoặc hỗ trợ dropdown chọn sprint lọc trên board.
- Hỗ trợ nút điều hướng từ Sprint Detail sang Board view mượt mà.

## Handoff Log
- Đã bổ sung `sprintFilter` trong `BoardPage` kết nối query parameter `?sprintId=...`.
- Đã bổ sung dropdown chọn Sprint trên thanh công cụ lọc của Kanban Board.
- Đã thêm nút "Mở trên Board" trong `SprintDetailDialog`.
- Trạng thái: ✅ Hoàn thành.
