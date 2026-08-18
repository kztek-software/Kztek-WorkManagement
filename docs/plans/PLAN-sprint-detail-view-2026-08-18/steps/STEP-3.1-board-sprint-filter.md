# STEP 3.1 — Tích hợp bộ lọc Sprint trên Board Page

## Nhiệm vụ
Cập nhật `src/app/projects/[projectId]/board/page.tsx`:
- Nhận diện query param `?sprintId=...` để tự động lọc board theo sprint nếu được chỉ định hoặc hỗ trợ dropdown chọn sprint lọc trên board.
- Hỗ trợ nút điều hướng từ Sprint Detail sang Board view mượt mà.
