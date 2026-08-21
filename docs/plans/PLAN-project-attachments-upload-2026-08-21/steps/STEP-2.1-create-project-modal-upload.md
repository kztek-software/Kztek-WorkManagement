---
step: 2.1
title: Tích hợp Upload tài liệu/ảnh/video vào Modal Khởi Tạo Dự Án Mới
agent: junior-developer
status: pending
---

# STEP 2.1: Tích hợp Upload vào Modal Khởi Tạo Dự Án Mới

## Mục tiêu
1. Trong `src/components/app-shell.tsx`:
   - Bổ sung state `projectAttachments` trong form tạo dự án mới.
   - Nhúng `FileUploadZone` với giao diện trực quan: hỗ trợ kéo thả tệp, ảnh và video (tối đa 25MB cho ảnh/tài liệu, 100MB cho video).
   - Hiển thị danh sách file đã tải lên kèm thumbnail/icon, kích thước, nút xóa.
   - Gửi payload `attachments` khi submit form gọi `POST /api/projects`.
   - Reset state attachments khi đóng modal hoặc tạo thành công.

## Handoff Log
- Chờ Phase 1 hoàn thành.
