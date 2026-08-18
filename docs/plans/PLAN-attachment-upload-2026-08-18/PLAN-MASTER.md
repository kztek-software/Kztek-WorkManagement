---
task: attachment-upload
created: 2026-08-18
updated: 2026-08-18
status: done
workflow: WF-FEATURE
priority: P2
---

# PLAN MASTER: Bổ sung phần Upload File, Ảnh, Video lỗi bên cạnh mô tả (Attachment Upload)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
Bổ sung tính năng tải lên tệp đính kèm (Hình ảnh PNG/JPG/GIF/WebP, Video MP4/WebM/MOV quay màn hình lỗi, và Tài liệu PDF/DOCX/LOG/TXT) nằm trực quan ngay bên cạnh ô mô tả chi tiết:
1. **Public Customer Portal**: Form gửi báo lỗi (`/portal` và `/portal/[projectKey]`) có khu vực kéo thả / chọn nhiều ảnh/video/file lỗi, xem trước thumbnail, hiển thị thanh tiến trình tải.
2. **Public Ticket Tracking**: Trang tra cứu (`/portal/tickets/[trackingCode]`) hiển thị gallery ảnh (lightbox phóng to), video player phát trực tiếp và danh sách file đính kèm.
3. **Internal Ticket Drawer**: Kỹ sư xem đầy đủ ảnh/video khách hàng đính kèm, tải thêm tài liệu phản hồi; khi 1-Click Convert sang Task thì tự động sao chép toàn bộ attachments.
4. **Kanban Task Dialog**: Khu vực đính kèm file/ảnh/video bên cạnh ô "Mô tả chi tiết" cho phép kéo thả upload, xem ảnh, phát video và quản lý tệp đính kèm.
5. **Backend & Storage**: Endpoint `POST /api/upload` lưu trữ an toàn trong `public/uploads/` và quản lý metadata qua bảng `Attachment`.

## Phases & Steps

### Phase 1: Database Migration & File Upload API
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Migration bảng `Attachment` trong SQLite `prisma/dev.db` & types `AttachmentDto` | Senior Developer | ✅ | `steps/STEP-1.1-db-migration.md` | 2026-08-18 14:05 |
| 1.2 | Xây dựng API route `POST /api/upload` & API CRUD `/api/attachments` | Senior Developer | ✅ | `steps/STEP-1.2-upload-api.md` | 2026-08-18 14:06 |

### Phase 2: Public Customer Portal & Tracking Gallery
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Tích hợp Upload dropzone bên cạnh mô tả trong Portal & Media Gallery trên trang tra cứu | Junior Developer | ✅ | `steps/STEP-2.1-portal-upload.md` | 2026-08-18 14:11 |

### Phase 3: Internal Ticket Drawer & Kanban Task Dialog
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Tích hợp Attachments vào `TicketDrawer` và tự động sao chép khi Convert sang Task | Senior Developer | ✅ | `steps/STEP-3.1-ticket-drawer-attachment.md` | 2026-08-18 14:12 |
| 3.2 | Tích hợp Upload file/ảnh/video bên cạnh mô tả trong `TaskDialog` trên Kanban Board | Senior Developer | ✅ | `steps/STEP-3.2-task-dialog-attachment.md` | 2026-08-18 14:13 |

### Phase 4: Review, Kiểm thử & Hoàn thiện
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 4.1 | UX/UI Review (C1–C7) và QA Verification toàn diện | QA Engineer | ✅ | `steps/STEP-4.1-review-qa.md` | 2026-08-18 14:14 |

## Artifacts dự kiến (tổng)
- [x] `prisma/schema.prisma` & `scripts/migrate-attachments.js`
- [x] `src/lib/types.ts`
- [x] `src/app/api/upload/route.ts`
- [x] `src/app/api/attachments/route.ts` & `src/app/api/attachments/[id]/route.ts`
- [x] `src/components/ui/file-upload-zone.tsx` (Component kéo thả upload dùng chung)
- [x] `src/components/ui/media-gallery.tsx` (Component hiển thị gallery ảnh/video/file)
- [x] `src/app/portal/page.tsx` & `src/app/portal/tickets/[trackingCode]/page.tsx`
- [x] `src/components/tickets/ticket-drawer.tsx`
- [x] `src/components/board/task-dialog.tsx`
- [x] `scripts/test-attachments-e2e.js`

