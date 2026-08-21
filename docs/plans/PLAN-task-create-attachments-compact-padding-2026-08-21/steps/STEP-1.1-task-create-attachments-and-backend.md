# STEP-1.1: Nâng cấp Backend API POST /api/projects/[projectId]/tasks

- **Agent thực hiện**: Senior Developer (L4)
- **Mục tiêu**: Bổ sung schema nhận mảng `attachments` và hỗ trợ đa định dạng `subtasks` khi tạo task mới.
- **Trạng thái**: Completed ✅

## Nội dung thực hiện
1. Cập nhật `createTaskSchema` trong `src/app/api/projects/[projectId]/tasks/route.ts`:
   - Bổ sung `attachments` schema nhận mảng các tệp đã upload (`fileName`, `fileUrl`, `fileType`, `fileSize`, `mimeType`).
   - Nâng cấp `subtasks` schema linh hoạt hỗ trợ cả dạng mảng chuỗi `string[]` và mảng đối tượng `{ title: string }[]`.
2. Trong hàm `POST`, khi tạo task bằng `prisma.task.create`:
   - Tự động liên kết tạo các `Attachment` record gắn với `taskId: task.id`, `projectId: projectId`, `uploaderId: user.id`.
   - Lưu trữ đầy đủ thuộc tính metadata của từng file đính kèm.

## Handoff Log
- Backend API `POST /api/projects/[projectId]/tasks` đã sẵn sàng nhận mảng `attachments` từ client.
- Chuyển giao sang Junior Developer (L5) để tích hợp UI upload tệp và tinh gọn padding trong `NewTaskDialog` (STEP-1.2).
