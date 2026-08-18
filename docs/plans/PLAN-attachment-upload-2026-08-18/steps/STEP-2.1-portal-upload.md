---
step: 2.1
plan: ../PLAN-MASTER.md
agent: junior-developer
status: done
completed_at: 2026-08-18 14:11
deps: ["1.2"]
---

# STEP 2.1 — Upload bên cạnh mô tả tại Customer Portal & Tracking Media Gallery

## Input nhận
Upload API từ Phase 1.

## Nhiệm vụ
1. Xây dựng component upload dùng chung `src/components/ui/file-upload-zone.tsx` hỗ trợ kéo thả, chọn file, xem trước thumbnail ảnh/video, thanh tiến trình upload.
2. Xây dựng component hiển thị tệp đính kèm `src/components/ui/media-gallery.tsx` hỗ trợ xem trước ảnh (lightbox modal phóng to), trình phát video và danh sách tải tài liệu.
3. Cập nhật `src/app/portal/page.tsx` & `src/app/portal/[projectKey]/page.tsx`:
   - Đặt khu vực Upload Dropzone ngay bên cạnh hoặc dưới ô "Mô tả chi tiết sự cố".
   - Tự động liên kết các file đã tải lên với ticket khi gửi.
4. Cập nhật `src/app/portal/tickets/[trackingCode]/page.tsx`:
   - Hiển thị Media Gallery cho khách hàng xem lại các hình ảnh/video/tài liệu đã đính kèm.

## Definition of Done
- [x] Portal cho phép đính kèm ảnh, video, tài liệu trực tiếp bên cạnh ô mô tả.
- [x] Trang tra cứu hiển thị đầy đủ hình ảnh phóng to (lightbox) và video player.

