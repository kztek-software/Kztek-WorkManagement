---
step: 2.1
plan: PLAN-customer-ticket-badge-contrast-2026-08-20
agent: Tech Lead / UX-UI Reviewer
status: done
completed: 2026-08-20 14:35
---

# STEP-2.1: Code Review & UX/UI Review

## Tech Lead Review
- Code thay đổi đúng phạm vi, không tác động tới logic nghiệp vụ hay API.
- Cú pháp Tailwind CSS chuẩn xác, sử dụng các biến responsive và variant `dark:` hài hòa.
- Build và type checking kiểm tra hoàn toàn PASS.

## UX/UI Review (C1 - C7)
- **C1 (Độ tương phản)**: Tỷ lệ tương phản màu chữ `text-amber-800` trên nền sáng đạt chuẩn WCAG AA (> 4.5:1), loại bỏ hoàn toàn hiện tượng chói và mờ nhạt của `text-amber-400`.
- **C2 (Nhất quán giao diện)**: Đồng bộ màu sắc cảnh báo màu hổ phách/amber trên cả 3 vị trí (Filter tab, Table row badge, Drawer badge).
- **C3 (Dark mode)**: Variant `dark:text-amber-300` và `dark:bg-amber-500/20` đảm bảo trên nền tối vẫn sáng rõ, sắc nét.
