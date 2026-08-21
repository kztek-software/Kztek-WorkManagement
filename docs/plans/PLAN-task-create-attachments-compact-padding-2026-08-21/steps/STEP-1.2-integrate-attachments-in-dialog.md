# STEP-1.2: Tích hợp vùng đính kèm tệp và thu gọn padding NewTaskDialog

- **Agent thực hiện**: Junior Developer (L5)
- **Mục tiêu**: Bổ sung khu vực tải lên tệp tin và tối ưu hóa mật độ hiển thị (compact padding) cho NewTaskDialog.
- **Trạng thái**: Completed ✅

## Nội dung thực hiện
1. Bổ sung state `attachments: UploadedFileItem[]` trong `src/components/board/new-task-dialog.tsx`.
2. Tích hợp `FileUploadZone` dạng compact với đầy đủ tính năng:
   - Kéo thả & chọn nhiều tệp ảnh PNG/JPG/WebP, video MP4/WebM/MOV quay màn hình lỗi, tài liệu PDF/DOCX/XLSX, file log/code/zip.
   - Hiển thị danh sách file đính kèm với thumbnail preview, tên file, kích thước, icon phân loại và nút xóa nhanh [✕].
   - Tự động xóa danh sách đính kèm khi đóng/mở dialog mới.
3. Khi submit `handleSubmit`, chuyển tiếp mảng `attachments` sang `POST /api/projects/[projectId]/tasks`.
4. Thu gọn padding toàn diện trong modal:
   - Container dialog padding: `p-3.5 sm:p-5 pt-1.5`
   - Form spacing: `space-y-3 sm:space-y-3.5`
   - Attribute grid: `gap-2.5`
   - Box Mô tả chi tiết & Danh sách việc con: padding `p-2.5 sm:p-3`, min-height `125px` / `105px`
   - Footer: padding `pt-2.5` với phím tắt `Ctrl+Enter`, `Esc`, `Alt+A`.

## Handoff Log
- `NewTaskDialog` đã hoàn chỉnh cả 2 tính năng đính kèm tệp tin và tinh gọn padding.
- Chuyển giao sang Junior Developer (L5) để tinh chỉnh padding trên Kanban Board View (STEP-2.1).
