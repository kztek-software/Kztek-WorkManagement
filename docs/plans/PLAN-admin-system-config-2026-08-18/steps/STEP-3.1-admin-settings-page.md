---
step: 3.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 14:05
deps: [2.1]
---

# STEP 3.1 — Xây dựng Trang Cấu hình Hệ thống Quản trị viên (`/projects/[projectId]/settings`)

## Input nhận
API `/api/system/config` và phân quyền ADMIN.

## Nhiệm vụ
1. Tạo trang `src/app/projects/[projectId]/settings/page.tsx`:
   - Phân quyền: Kiểm tra `user.role === "ADMIN"`. Nếu không phải Admin, hiển thị thông báo "Truy cập bị từ chối" và nút quay về bảng Kanban.
   - Giao diện 4 phân hệ Tab:
     1. **Email & SMTP**: Cấu hình Host, Port, User, Password, Secure, From Email, From Name, Nút Lưu cấu hình & Nút Kiểm tra kết nối SMTP.
     2. **Thương hiệu & Đơn vị**: Tên hệ thống, Công ty, Hotline, Website, Email hỗ trợ.
     3. **Quy tắc Thông báo**: Tùy chỉnh bật/tắt gửi email giao việc, đổi trạng thái, bình luận, realtime SSE.
     4. **Trạng thái & Chẩn đoán**: Xem thông số môi trường, cơ sở dữ liệu và phiên bản hệ thống.

## Definition of Done
- [x] Trang Settings chỉ có ADMIN mới xem và chỉnh sửa được.
- [x] Cho phép lưu và kiểm tra cấu hình SMTP tức thì.

## Đã làm
- Xây dựng hoàn chỉnh trang `src/app/projects/[projectId]/settings/page.tsx` với 4 tab cấu hình, kiểm tra phân quyền, tích hợp live test email và toast alerts.

## Artifact
- `src/app/projects/[projectId]/settings/page.tsx`
