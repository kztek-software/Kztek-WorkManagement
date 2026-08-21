# STEP 3.1: Code Review, UX/UI Review (C1–C7) và QA Verification E2E

- **Agent thực hiện**: QA Engineer & Tech Lead
- **Trạng thái**: ✅ Done (2026-08-21 09:25)
- **Files liên quan**:
  - `scripts/test-project-attachments-e2e.ts`
  - `code-graph/CODE-GRAPH.md`

## 1. Kết Quả Kiểm Thử Tự Động E2E
Đã chạy script E2E tự động `scripts/test-project-attachments-e2e.ts` tương tác trực tiếp với Microsoft SQL Server (`WorkingManager`):
- ✅ [PASS] Kết nối user Admin và tạo dự án mới kèm 3 tệp đính kèm (`.pdf`, `.png`, `.mp4`).
- ✅ [PASS] Xác thực lưu trữ 3 attachments với metadata chính xác (`fileName`, `fileType`, `fileSize`, `mimeType`, `uploaderId`, `projectId`).
- ✅ [PASS] Bổ sung thêm tệp tài liệu mới (`.xlsx`) vào dự án thành công (tổng 4 attachments).
- ✅ [PASS] Xóa 1 tệp đính kèm khỏi dự án và cập nhật lại danh sách tức thì (còn 3 attachments).
- ✅ [PASS] Xóa toàn bộ dự án và dọn dẹp sạch sẽ attachments liên quan trong transaction (còn 0 attachments).
- ✅ **100% PASS (7/7 tiêu chí)**.

## 2. Đánh Giá UX/UI (Tiêu Chí C1–C7)
- **C1 (Layout & Visual Rhythm)**: Vùng upload trong Modal "Khởi Tạo Dự Án Mới" và Dashboard bố trí cân đối, hài hòa với phong cách KZTEK.
- **C2 (Interactive States)**: Hỗ trợ Drag & Drop nổi bật viền `border-accent`, trạng thái tải lên hiển thị spinner trực quan.
- **C3 (Dark / Light Theme)**: Hoàn toàn sử dụng CSS tokens (`bg-surface`, `bg-surface-2`, `border-line`, `text-accent`), hiển thị chuẩn nét trên cả 2 theme.
- **C4 (Lightbox & Media Player)**: Xem trước ảnh sắc nét, xem trước video MP4/WebM có trình phát đầy đủ âm thanh/fullscreen.
- **C5 (File Types & Icons)**: Phân loại icon và màu sắc trực quan (Ảnh xanh lá, Video tím, Nén vàng, Code/Data xanh dương, Doc cyan).
- **C6 (Type Safety)**: `tsc --noEmit` đạt 0 lỗi.
- **C7 (Permissions)**: Chủ dự án và Admin có quyền xóa tệp, người dùng có quyền xem và tải xuống.
