---
step: 1.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 13:54
deps: []
---

# STEP 1.1 — Xây dựng Email Service (`src/lib/mail.ts`) & Branded HTML Templates

## Input nhận
Yêu cầu gửi email khi giao việc và các sự kiện liên quan đến công việc trong hệ thống KZTEK Work Management. Cần hỗ trợ SMTP cấu hình qua biến môi trường hoặc tự động fallback sang Simulated Outbox Log khi chạy dev/test.

## Nhiệm vụ
1. Tạo module `src/lib/mail.ts` với SMTP transporter client (hỗ trợ TLS/STARTTLS/Direct socket & REST API fallback).
2. Xây dựng bộ tạo mẫu HTML Email chuyên nghiệp, responsive theo chuẩn nhận diện thương hiệu KZTEK (#251C53 Tím than, #F05922 Cam):
   - `generateTaskAssignedEmailHtml`: Email giao việc với đầy đủ mã task, tiêu đề, mô tả, mức độ ưu tiên, hạn hoàn thành, người giao việc và nút bấm trực tiếp "Xem công việc".
   - `generateStatusChangedEmailHtml`: Email cập nhật tiến độ công việc.
   - `generateTaskCommentEmailHtml`: Email thông báo có thảo luận/bình luận mới.
   - `generateTestEmailHtml`: Email kiểm tra cấu hình hệ thống.
3. Cài đặt hệ thống lưu trữ bộ nhớ đệm Email Outbox (`emailOutbox`) để phục vụ xem lại lịch sử và preview HTML.

## Definition of Done
- [x] Module `src/lib/mail.ts` export đầy đủ các hàm gửi mail (`sendMail`, `sendTaskAssignedEmail`, `sendStatusChangedEmail`, `sendTaskCommentEmail`, `sendTestEmail`, `getEmailLogs`).
- [x] Mẫu email HTML hiển thị sắc nét, tương thích mọi email client (Gmail, Outlook, Apple Mail, Webmail).

## Đã làm
- Xây dựng module `src/lib/mail.ts` hoàn chỉnh với client SMTP Socket RFC 5321 (hỗ trợ STARTTLS và AUTH LOGIN) cùng cơ chế tự động fallback sang Simulated Outbox Log khi chưa cấu hình biến môi trường SMTP.
- Thiết kế 4 bộ mẫu HTML Email chuẩn nhận diện thương hiệu KZTEK với bảng thông tin chi tiết và nút CTA trực quan.
- Xây dựng kho lưu trữ Email Outbox Log hỗ trợ tối đa 200 bản ghi phục vụ xem lại lịch sử và preview trực tiếp.

## Artifact
- `src/lib/mail.ts`
