---
step: 2.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 13:55
deps: [1.1]
---

# STEP 2.2 — Xây dựng API Lấy Lịch sử Email & Gửi thử nghiệm (`/api/notifications/email-logs`)

## Input nhận
Email Outbox và helper functions từ `src/lib/mail.ts`.

## Nhiệm vụ
Tạo route `src/app/api/notifications/email-logs/route.ts`:
- `GET`: Lấy danh sách email outbox log, hỗ trợ search theo email/tiêu đề và lấy chi tiết nội dung HTML.
- `POST`: Gửi email thử nghiệm (Test Email) tới địa chỉ người dùng chỉ định để kiểm tra đường truyền SMTP / Template HTML.

## Definition of Done
- [x] API trả về danh sách email và cho phép gửi test thành công.

## Đã làm
- Xây dựng API endpoint `/api/notifications/email-logs` với đầy đủ handler GET (danh sách & filter), POST (gửi email test) và DELETE (xóa outbox).

## Artifact
- `src/app/api/notifications/email-logs/route.ts`
