---
step: 2.1
name: appshell-navigation
agent: senior-developer
status: done
---

# STEP 2.1: Triển Khai Mobile Drawer Sidebar, Header Hamburger & Bottom Navigation Bar

## Mục tiêu
Chỉnh sửa `src/components/app-shell.tsx` và `src/app/globals.css` để triển khai Drawer Sidebar di động, Header responsive và Mobile Bottom Bar.

## Danh sách công việc
1. Thêm `mobileMenuOpen` state trong `AppShell`.
2. Biến đổi Aside Sidebar: `hidden lg:flex` trên desktop và `fixed inset-y-0 left-0 z-50` khi `mobileMenuOpen` bật trên mobile.
3. Bổ sung nút Hamburger (`lg:hidden`) tại Header góc trên trái.
4. Bổ sung component Mobile Bottom Navigation Bar (`lg:hidden fixed bottom-0 left-0 right-0 z-40`).
5. Thêm padding bottom `pb-16 lg:pb-0` cho thẻ `<main>` để nội dung trang không bị che bởi thanh điều hướng đáy.
