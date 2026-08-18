# STEP 2.3 — Tích hợp sự kiện click mở Sprint Detail vào SprintsPage

## Nhiệm vụ
Cập nhật `src/app/projects/[projectId]/sprints/page.tsx`:
- Gán sự kiện click cho các thẻ Sprint để mở `SprintDetailDialog`.
- Thêm visual cues (hover effects, nút Chi tiết Sprint, badge tương tác).
- Tích hợp `SprintDetailDialog` và `TaskDialog` khi bấm vào task trong sprint.

## Handoff Log
- Cả thẻ Sprint đều có hiệu ứng hover nổi bật và sự kiện `onClick` mở `SprintDetailDialog`.
- Thêm nút rõ ràng "Chi tiết Sprint" có icon mũi tên chuyển động nhẹ.
- Các nút hành động riêng biệt ("Kích hoạt Sprint", "Đóng Sprint") được bọc `e.stopPropagation()` để không gây xung đột click.
- Tích hợp `TaskDialog` cho phép drill-down mở chi tiết bất kỳ công việc nào.
- Trạng thái: ✅ Hoàn thành.
