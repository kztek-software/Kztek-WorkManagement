---
task: task-create-attachments-compact-padding
created: 2026-08-21
updated: 2026-08-21
status: completed
workflow: WF-BUGFIX
priority: P2
---

# PLAN MASTER: Bổ sung ô đính kèm tệp tin khi Tạo mới Task & Tối ưu hóa thu gọn padding

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở steps/STEP-[N.M]-[tên].md tương ứng.

## 1. Mô tả yêu cầu & Mục tiêu
Giải quyết 2 vấn đề theo phản hồi của người dùng:
1. **Thiếu ô đính kèm tệp tin (File Attachments) khi Tạo mới Task**:
   - Tích hợp vùng tải lên / kéo thả tệp tin (Ảnh chụp màn hình, Video quay lỗi, Tài liệu PDF/DOCX/XLSX/LOG/ZIP/JSON) vào trực tiếp `NewTaskDialog`.
   - Hiển thị danh sách tệp đính kèm trực quan với icon nhận diện, tên tệp, dung lượng, và nút xóa tệp trước khi tạo task.
   - Mở rộng API `POST /api/projects/[projectId]/tasks` hỗ trợ nhận mảng `attachments` và tự động tạo các bản ghi `Attachment` liên kết với task mới.
2. **Padding quá nhiều (Excessive Padding)**:
   - **Trong Modal Tạo Task (`NewTaskDialog`)**: Thu gọn padding bao ngoài từ `p-4 sm:p-6` xuống `p-3.5 sm:p-4.5`, giảm khoảng cách form `space-y-4` xuống `space-y-3`, tinh gọn padding các box con (Mô tả, Việc con, Thuộc tính) từ `p-3.5` xuống `p-2.5` để modal gọn gàng, không bị tràn cuộn hay lãng phí diện tích.
   - **Trên Kanban Board View (`board/page.tsx` & `board-column.tsx`)**: Tinh chỉnh khoảng cách lề và padding của Header (`sm:h-12 px-3 sm:px-4`), Filter Bar (`py-1.5 px-3 sm:px-4`), Board Viewport (`p-2 sm:p-3 md:p-3.5`) và Board Column (`p-2`), giúp các cột và thẻ task hiển thị sắc nét, thoáng đãng mà không bị thừa thãi khoảng trắng.

## 2. Phases & Steps

### Phase 1: Mở rộng Backend API & Tích hợp ô Đính kèm Tệp + Thu gọn Padding NewTaskDialog
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Nâng cấp API `POST /api/projects/[projectId]/tasks` nhận mảng `attachments` và xử lý đa định dạng `subtasks` | Senior Developer | ✅ | steps/STEP-1.1-task-create-attachments-and-backend.md | 2026-08-21 13:50 |
| 1.2 | Tích hợp vùng đính kèm tệp (`FileUploadZone`) và thu gọn padding trong `NewTaskDialog` | Junior Developer | ✅ | steps/STEP-1.2-integrate-attachments-in-dialog.md | 2026-08-21 13:51 |

### Phase 2: Tối ưu hóa Padding Board View, UX/UI Inspection & Verification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Tinh chỉnh padding và khoảng cách lề trên Kanban Board View (`board/page.tsx` & `board-column.tsx`) | Junior Developer | ✅ | steps/STEP-2.1-optimize-board-padding.md | 2026-08-21 13:52 |
| 2.2 | Code Review, UX/UI Review (C1–C7), Smoke Test xác nhận luồng upload tệp khi tạo task và cập nhật CODE-GRAPH | Tech Lead & QA Engineer | ✅ | steps/STEP-2.2-review-and-qa.md | 2026-08-21 13:52 |

## 3. Danh sách Artifacts dự kiến
- [x] `src/app/api/projects/[projectId]/tasks/route.ts`
- [x] `src/components/board/new-task-dialog.tsx`
- [x] `src/app/projects/[projectId]/board/page.tsx`
- [x] `src/components/board/board-column.tsx`
- [x] `code-graph/CODE-GRAPH.md`
