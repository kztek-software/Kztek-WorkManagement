---
step: 1.2
plan: ../PLAN-MASTER.md
agent: senior-developer
status: done
completed_at: 2026-08-18 14:04
deps: [1.1]
---

# STEP 1.2 — Xây dựng API Quản trị Cấu hình Hệ thống (`/api/system/config`)

## Input nhận
Module `src/lib/system-config.ts` và cơ chế xác thực người dùng `src/lib/auth.ts`.

## Nhiệm vụ
1. Tạo route `src/app/api/system/config/route.ts`:
   - `GET`: Kiểm tra quyền `user.role === "ADMIN"`. Trả về cấu hình hệ thống hiện tại (mật khẩu SMTP được che an toàn dạng `******`).
   - `POST` / `PUT`: Kiểm tra quyền `user.role === "ADMIN"`. Cập nhật cấu hình SMTP, Branding và Notification rules.
2. Trả lỗi 403 Forbidden nếu người dùng không phải là ADMIN.

## Definition of Done
- [x] API bảo mật tuyệt đối, chỉ có ADMIN mới có quyền GET và POST.

## Đã làm
- Xây dựng endpoint `/api/system/config` với schema Zod validation và kiểm tra quyền `user.role === "ADMIN"` chặt chẽ ở cả GET và POST handlers.

## Artifact
- `src/app/api/system/config/route.ts`
