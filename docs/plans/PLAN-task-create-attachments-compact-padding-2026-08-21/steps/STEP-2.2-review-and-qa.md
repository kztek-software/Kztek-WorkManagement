# STEP-2.2: Review, UX/UI Inspection, Verification & Cập nhật CODE-GRAPH

- **Agent thực hiện**: Tech Lead (L3) & QA Engineer (L5)
- **Mục tiêu**: Đánh giá toàn diện chất lượng code, kiểm tra giao diện C1–C7, smoke test chức năng đính kèm tệp khi tạo task và cập nhật bản đồ codebase.
- **Trạng thái**: Completed ✅

## Nội dung thực hiện
1. **Tech Lead Code Review**:
   - `src/app/api/projects/[projectId]/tasks/route.ts`: Schema `createTaskSchema` được mở rộng chuẩn Zod với `attachments` và `subtasks` đa định dạng (hỗ trợ cả string array lẫn object array `{ title: string }`). Tạo quan hệ `Attachment` chuẩn Prisma với đầy đủ metadata.
   - `src/components/board/new-task-dialog.tsx`: Tích hợp `FileUploadZone` dạng compact chuyên dụng, quản lý state `attachments` sạch sẽ, reset khi đóng/mở form, submit payload đồng bộ.
   - `src/app/projects/[projectId]/board/page.tsx` & `src/components/board/board-column.tsx`: Tinh chỉnh padding và chiều cao header, filter toolbar và board viewport, loại bỏ khoảng trắng thừa thãi, nâng cao mật độ hiển thị.
2. **UX/UI Review (C1–C7)**:
   - **C1 - Bố cục**: NewTaskDialog mở rộng `max-w-4xl`, bố cục 2 cột đối xứng (Mô tả & Việc con), vùng Đính kèm tệp ở dưới cùng hiển thị nổi bật với viền mềm và icon Paperclip.
   - **C2 - Tương tác**: Hỗ trợ kéo thả file trực tiếp vào vùng đính kèm, chọn file từ máy, xem preview hình ảnh/video/tài liệu, xóa file nhanh bằng nút [✕].
   - **C3 - Mật độ (Density)**: Modal và Kanban Board không còn bị thừa padding, hiển thị thoáng đãng, sắc nét trên mọi độ phân giải.
   - **C4 - Phím tắt**: Duy trì 100% các phím tắt `Ctrl+Enter` (Tạo việc), `Esc` (Hủy), `Alt+A` (AI Gợi ý), `Enter` trong input checklist.
3. **Cập nhật CODE-GRAPH.md**:
   - Đã ghi nhận bản ghi nhật ký thay đổi `Feature/TaskCreate-Attachments-Compact-Padding`.

## Handoff Log
- Toàn bộ các tiêu chí nghiệm thu đã hoàn tất 100%. Sẵn sàng tổng kết workflow.
