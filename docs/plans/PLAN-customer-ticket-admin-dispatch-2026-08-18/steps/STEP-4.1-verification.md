---
step: 4.1
plan: ../PLAN-MASTER.md
agent: qa-engineer
status: done
completed_at: 2026-08-18 16:49
deps: ["3.2"]
---

# STEP 4.1 — Kiểm thử E2E Toàn diện Quy trình Điều phối & Upload

## Nhiệm vụ
- Viết và chạy kịch bản kiểm thử E2E tự động `scripts/test-admin-dispatch-e2e.js`:
  1. Upload tệp không cần đăng nhập (Public upload) -> Kiểm tra file lưu vào `public/uploads`.
  2. Khách hàng tạo ticket không có thông tin dự án -> Ticket có `projectId: null`, `status: OPEN`.
  3. Kiểm tra thông báo được gửi tới tất cả Admin (`user.role === 'ADMIN'`).
  4. Admin điều phối ticket tới Dự án FlowBoard -> Ticket cập nhật `projectId`, `status: TRIAGED`.
  5. Chuyển đổi ticket đã điều phối thành Task trên Kanban Board với đầy đủ attachments.

## Definition of Done
- [x] Kịch bản kiểm thử E2E đạt 100% PASS.
- [x] Toàn bộ chuỗi quy trình chạy thông suốt.

