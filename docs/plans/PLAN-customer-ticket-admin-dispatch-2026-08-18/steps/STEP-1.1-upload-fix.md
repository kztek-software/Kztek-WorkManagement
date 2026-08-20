---
step: 1.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 16:44
deps: []
---

# STEP 1.1 — Sửa API Upload cho phép Public & Nhận đa dạng Key

## Nhiệm vụ
- Sửa `src/app/api/upload/route.ts`:
  - Không bắt buộc `requireUser()` (chuyển sang `getSessionUser()`, cho phép khách hàng chưa đăng nhập trên Portal gửi file ảnh/video).
  - Đọc cả `formData.getAll("files")` và `formData.getAll("file")` để tương thích mọi client component.
  - Tự động tạo thư mục `public/uploads` nếu chưa có.

## Definition of Done
- [x] Khách hàng chưa đăng nhập tải file thành công không bị lỗi 401.
- [x] Nhận diện đúng định dạng ảnh/video/tài liệu và lưu file an toàn.

