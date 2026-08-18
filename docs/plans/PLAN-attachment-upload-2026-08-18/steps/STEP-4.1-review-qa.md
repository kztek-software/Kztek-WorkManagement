---
step: 4.1
plan: ../PLAN-MASTER.md
agent: qa-engineer
status: done
completed_at: 2026-08-18 14:14
deps: ["3.2"]
---

# STEP 4.1 — UX/UI Review & QA Verification toàn diện

## Input nhận
Toàn bộ tính năng upload file, ảnh, video trên Portal và Kanban Task Dialog.

## Nhiệm vụ
1. UX/UI Review đánh giá 7 tiêu chuẩn trực quan (C1–C7): tính trực quan khi kéo thả file, preview thumbnail ảnh/video, layout cân đối bên cạnh ô mô tả.
2. Viết kịch bản kiểm thử E2E tự động `scripts/test-attachments-e2e.js`:
   - Upload file ảnh, video, tài liệu.
   - Gắn vào Ticket khách hàng.
   - Kiểm tra hiển thị trên Portal Tracking.
   - Chuyển đổi Ticket sang Task và kiểm tra sao chép Attachment sang Task.
   - Thao tác xóa Attachment.

## Definition of Done
- [x] UX/UI Review đạt tiêu chuẩn PASS.
- [x] Kịch bản kiểm thử E2E tự động đạt 100% PASS.

