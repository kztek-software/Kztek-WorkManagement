---
step: 1.1
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 14:04
deps: []
---

# STEP 1.1 — Xây dựng module Cấu hình Hệ thống (`src/lib/system-config.ts`)

## Input nhận
Yêu cầu lưu trữ và quản lý cấu hình hệ thống (SMTP, Branding, Notification rules) cho phép Quản trị viên cập nhật trực tiếp từ giao diện.

## Nhiệm vụ
1. Tạo module `src/lib/system-config.ts` quản lý cấu hình hệ thống (lưu trữ an toàn, cache và nạp từ DB / ENV).
2. Tích hợp `getEffectiveSmtpConfig()` vào `src/lib/mail.ts` để tự động ưu tiên cấu hình SMTP do Admin thiết lập trên giao diện.

## Definition of Done
- [x] Module `system-config.ts` cung cấp đầy đủ các hàm đọc, ghi và bảo vệ mật khẩu SMTP.
- [x] `mail.ts` tự động nhận cấu hình mới ngay sau khi Admin cập nhật.

## Đã làm
- Xây dựng module `src/lib/system-config.ts` với đầy đủ kiểu dữ liệu `SystemConfigData`, hàm `getSystemConfig()`, `getMaskedSystemConfig()`, `updateSystemConfig()`, `getEffectiveSmtpConfig()`.
- Tích hợp `getEffectiveSmtpConfig()` vào `src/lib/mail.ts` để runtime tự động nhận thông số SMTP mới lưu từ giao diện mà không cần restart server.

## Artifact
- `src/lib/system-config.ts`
- `src/lib/mail.ts`
