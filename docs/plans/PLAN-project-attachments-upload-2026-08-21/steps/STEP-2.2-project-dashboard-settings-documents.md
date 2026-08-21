---
step: 2.2
title: Xây dựng ProjectAttachmentGallery và tích hợp vào Dashboard & Settings
agent: junior-developer
status: pending
---

# STEP 2.2: ProjectAttachmentGallery & Tích hợp Dashboard & Settings

## Mục tiêu
1. Tạo component `src/components/project/project-attachment-gallery.tsx`:
   - Hiển thị danh mục tài liệu & media của dự án (Ảnh, Video, Tài liệu PDF/DOCX/XLSX/LOG/ZIP).
   - Hỗ trợ xem trước phóng to (Lightbox cho ảnh, Video player cho video).
   - Hỗ trợ tải trực tiếp tài liệu mới vào dự án, tải file về máy, hoặc xóa tệp (nếu có quyền).
2. Tích hợp vào `src/app/projects/[projectId]/dashboard/page.tsx`:
   - Hiển thị widget/card "Tài liệu & Đính kèm Dự án" trực quan trong Dashboard, cho phép tải lên và xem tài liệu dự án trực tiếp.
3. Tích hợp vào `src/app/projects/[projectId]/settings/page.tsx`:
   - Thêm tab hoặc section "Tài liệu dự án" để quản lý kho tài liệu đầy đủ của dự án.

## Handoff Log
- Chờ Bước 2.1 hoàn thành.
