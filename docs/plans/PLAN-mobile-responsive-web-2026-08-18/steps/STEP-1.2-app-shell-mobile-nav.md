---
step: 1.2
name: app-shell-mobile-nav
agent: ui-ux-designer
status: done
---

# STEP 1.2: Thiết Kế Kiến Trúc Responsive Layout, Breakpoints & Thumb Zone

## Mục tiêu
Định nghĩa hệ thống Breakpoints Tailwind, cấu trúc Drawer trượt, thiết kế thanh Bottom Bar chuẩn Thumb-Zone và giải pháp Safe Area Inset cho iOS/Android.

## Đặc tả kỹ thuật & Giao diện
1. **Breakpoints**:
   - `sm:` $\ge 640px$
   - `md:` $\ge 768px$
   - `lg:` $\ge 1024px$ (Điểm chuyển đổi giữa Desktop Sidebar và Mobile Drawer)
   - `xl:` $\ge 1280px$
2. **Drawer Sidebar**:
   - Vị trí: `fixed inset-y-0 left-0 z-50 w-72 bg-surface/98 backdrop-blur-2xl border-r border-line`
   - Backdrop: `fixed inset-0 z-40 bg-black/60 backdrop-blur-sm`
   - Hiệu ứng chuyển động mượt mà khi mở/đóng.
3. **Mobile Bottom Navigation Bar**:
   - Vị trí: `fixed bottom-0 left-0 right-0 z-40 h-16 bg-surface/95 backdrop-blur-lg border-t border-line px-2 flex items-center justify-around`
   - 5 mục chính: Dashboard, Board, Sprints, Tickets, Menu.
