---
step: 2.1
plan: ../PLAN-MASTER.md
agent: junior-developer
status: done
completed_at: 2026-08-18 14:04
deps: [1.2]
---

# STEP 2.1 — Chuyển thông tin tài khoản lên góc trên phải & Cập nhật Header trong `AppShell`

## Input nhận
Yêu cầu di chuyển thông tin tài khoản (Avatar, Name, Email, Admin badge, NotificationBell, Logout) lên góc trên phải màn hình và làm thoáng chân Sidebar.

## Nhiệm vụ
1. Cập nhật `src/components/app-shell.tsx`:
   - Thêm thanh Header cố định phía trên `<main>` gồm: Breadcrumbs bên trái; Nút Cấu hình hệ thống (Admin), NotificationBell và User Account Dropdown Menu bên phải.
   - Thêm menu Cấu hình Hệ Thống vào Sidebar navigation (chỉ hiển thị khi `user.role === "ADMIN"`).
   - Xóa bỏ footer tài khoản chật chội ở chân sidebar bên trái.

## Definition of Done
- [x] Thông tin tài khoản hiển thị trang nhã, chuyên nghiệp ở góc trên phải.
- [x] Không còn hiện tượng bị che khuất bởi thông báo toast.

## Đã làm
- Cập nhật `src/components/app-shell.tsx` với thanh sticky Header trên cùng chứa breadcrumbs, nút Admin Settings, NotificationBell và User Account Menu Dropdown.
- Tinh chỉnh Sidebar footer thành dải trạng thái hệ thống tối giản.

## Artifact
- `src/components/app-shell.tsx`
