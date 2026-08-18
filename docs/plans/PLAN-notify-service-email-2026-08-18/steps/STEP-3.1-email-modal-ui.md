---
step: 3.1
plan: ../PLAN-MASTER.md
agent: junior-developer
status: done
completed_at: 2026-08-18 13:56
deps: [2.2]
---

# STEP 3.1 — Xây dựng Giao diện Email Logs Modal & Tích hợp Notification Bell

## Input nhận
API `/api/notifications/email-logs` và `NotificationBell`.

## Nhiệm vụ
1. Tạo component `src/components/notifications/email-log-modal.tsx`:
   - Danh sách email đã gửi/mô phỏng kèm trạng thái badge (`SENT`, `SIMULATED`, `FAILED`).
   - Khung xem trước (HTML Preview iframe/sanitized) hiển thị trực quan email chuẩn thương hiệu.
   - Form gửi email thử nghiệm (Test Email) với email người nhận tùy chỉnh.
2. Tích hợp nút mở modal vào `src/components/notifications/notification-bell.tsx`.

## Definition of Done
- [x] Người dùng và quản trị viên có thể xem lịch sử email và test gửi mail trực tiếp từ giao diện.

## Đã làm
- Xây dựng component `src/components/notifications/email-log-modal.tsx` chia 2 cột: danh sách outbox & công cụ gửi test bên trái, live iframe preview email chuẩn thương hiệu KZTEK bên phải.
- Tích hợp nút mở modal vào chân popover của `NotificationBell` và truyền `currentUserEmail` từ `AppShell`.

## Artifact
- `src/components/notifications/email-log-modal.tsx`
- `src/components/notifications/notification-bell.tsx`
- `src/components/app-shell.tsx`
