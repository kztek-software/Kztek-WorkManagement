---
task: project-attachments-upload
created: 2026-08-21
updated: 2026-08-21
status: done
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Bổ sung cho phép đẩy tài liệu dự án (File, Ảnh, Video)

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## 1. Mô tả yêu cầu & Mục tiêu
Bổ sung tính năng cho phép tải lên, quản lý và xem trước toàn diện các tài liệu dự án (bao gồm tệp tin tài liệu PDF/DOCX/XLSX/LOG/ZIP, hình ảnh PNG/JPG/WebP/GIF, và video MP4/WebM/MOV) trên toàn bộ hệ thống:
1. **Modal Khởi Tạo Dự Án Mới ("Khởi Tạo Dự Án Mới")**: Tích hợp vùng kéo thả / chọn nhiều tệp tin, hình ảnh mô tả, video giới thiệu hoặc tài liệu đặc tả dự án ngay trong form tạo dự án; tự động tải lên và lưu liên kết với dự án mới.
2. **Tổng Quan Dự Án (Dashboard / Overview)**: Bổ sung khối "Tài liệu & Đính kèm Dự án" (Project Documents & Media) trực quan (tab Tài liệu & Media trong bảng phân tích), hiển thị thư viện ảnh/video (lightbox phóng to, video player), danh sách tài liệu tải về, cùng nút tải lên tài liệu mới nhanh chóng.
3. **Cài Đặt & Chỉnh Sửa Dự Án (Settings & All Projects Edit)**: Hỗ trợ quản trị viên và chủ dự án xem, tải lên thêm, tải về hoặc xóa các tệp tài liệu đính kèm của dự án.
4. **Cơ sở dữ liệu & Backend APIs**:
   - Mở rộng model `Attachment` và `Project` trong `prisma/schema.prisma` hỗ trợ quan hệ `projectId` (chống cascade cycle SQL Server).
   - Cập nhật API `POST /api/projects`, `GET /api/projects/[projectId]`, `PATCH /api/projects/[projectId]`, `POST /api/attachments`.
   - Bổ sung API chuyên dụng `GET /api/projects/[projectId]/attachments` và `POST /api/projects/[projectId]/attachments`, `DELETE /api/projects/[projectId]/attachments`.

## 2. Phases & Steps

### Phase 1: Database Schema & Backend APIs
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Cập nhật `prisma/schema.prisma` (Project.attachments, Attachment.projectId) & đồng bộ DB MSSQL + `types.ts` | Senior Developer | ✅ | `steps/STEP-1.1-db-prisma-schema.md` | 2026-08-21 09:18 |
| 1.2 | Nâng cấp các API routes (`/api/projects`, `/api/projects/[projectId]`, `/api/attachments`, `/api/projects/[projectId]/attachments`) | Senior Developer | ✅ | `steps/STEP-1.2-backend-project-attachments-api.md` | 2026-08-21 09:20 |

### Phase 2: Giao diện Modal Khởi Tạo & Dashboard Dự Án
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Tích hợp khu vực Upload tài liệu/ảnh/video vào Modal "Khởi Tạo Dự Án Mới" (`app-shell.tsx`) | Junior Developer | ✅ | `steps/STEP-2.1-create-project-modal-upload.md` | 2026-08-21 09:21 |
| 2.2 | Xây dựng component `ProjectAttachmentGallery` và tích hợp vào Dashboard & Settings Dự Án | Junior Developer | ✅ | `steps/STEP-2.2-project-dashboard-settings-documents.md` | 2026-08-21 09:23 |

### Phase 3: Review, Kiểm Thử & Nghiệm Thu
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Code Review, UX/UI Review (C1–C7) và QA Verification E2E | QA Engineer & Tech Lead | ✅ | `steps/STEP-3.1-qa-verification.md` | 2026-08-21 09:25 |

## 3. Danh sách Artifacts đã hoàn thiện
- [x] `prisma/schema.prisma`
- [x] `src/lib/types.ts`
- [x] `src/app/api/attachments/route.ts`
- [x] `src/app/api/projects/route.ts`
- [x] `src/app/api/projects/[projectId]/route.ts`
- [x] `src/app/api/projects/[projectId]/attachments/route.ts`
- [x] `src/components/app-shell.tsx`
- [x] `src/components/project/project-attachment-gallery.tsx`
- [x] `src/app/projects/[projectId]/dashboard/page.tsx`
- [x] `src/app/projects/[projectId]/all-projects/page.tsx`
- [x] `scripts/test-project-attachments-e2e.ts`
- [x] `code-graph/CODE-GRAPH.md`
