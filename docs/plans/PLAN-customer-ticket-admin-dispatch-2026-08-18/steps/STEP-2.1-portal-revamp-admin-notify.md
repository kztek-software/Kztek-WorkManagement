---
step: 2.1
plan: ../PLAN-MASTER.md
agent: junior-developer
status: done
completed_at: 2026-08-18 16:46
deps: ["1.2"]
---

# STEP 2.1 — Ẩn Dự án trên Portal & Gửi Thông Báo Tự Động tới Admin

## Nhiệm vụ
- Cập nhật `src/app/portal/page.tsx`:
  - Loại bỏ hoàn toàn dropdown và state `selectedProjectId`, `projects`.
  - Khách hàng chỉ tập trung điền tiêu đề sự cố, phân loại, mức độ khẩn cấp, mô tả lỗi, tệp đính kèm và thông tin liên hệ.
- Cập nhật `src/app/api/tickets/public/route.ts`:
  - Tạo ticket với `projectId: null` (hoặc `OPEN - CHỜ ĐIỀU PHỐI`).
  - Tìm tất cả người dùng có quyền `role === "ADMIN"` trong cơ sở dữ liệu.
  - Gửi Notification in-app và email cảnh báo cho từng Admin để kịp thời điều phối.

## Definition of Done
- [x] Portal hoàn toàn không hiển thị thông tin hay bắt khách hàng chọn dự án.
- [x] Khi có ticket mới, toàn bộ tài khoản Admin nhận được thông báo điều phối.

