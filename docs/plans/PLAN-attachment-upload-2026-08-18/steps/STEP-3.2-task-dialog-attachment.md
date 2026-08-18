---
step: 3.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 14:13
deps: ["3.1"]
---

# STEP 3.2 — Tích hợp Upload File/Ảnh/Video bên cạnh Mô tả trong Task Dialog

## Input nhận
Upload API và Media components từ các bước trước.

## Nhiệm vụ
1. Cập nhật `TaskDialog` (`src/components/board/task-dialog.tsx`):
   - Đặt khu vực Attachments ngay dưới/bên cạnh ô "Mô tả chi tiết".
   - Cho phép kéo thả trực tiếp file, ảnh, video vào task.
   - Hiển thị danh sách ảnh/video xem ngay, nút phóng to lightbox, nút tải xuống và xóa tệp.
2. Cập nhật API GET `/api/projects/[projectId]/tasks/[taskId]` để trả về kèm quan hệ `attachments`.

## Definition of Done
- [x] TaskDialog trên Kanban Board hiển thị MediaGallery và FileUploadZone bên cạnh mô tả chi tiết.
- [x] Cho phép tải thêm, xem phóng to và xóa tệp đính kèm.

