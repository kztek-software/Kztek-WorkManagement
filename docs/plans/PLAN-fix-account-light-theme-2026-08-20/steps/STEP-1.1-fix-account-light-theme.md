---
step: 1.1
title: Chuyển đổi mã màu Account dropdown & popovers sang CSS tokens
agent: junior-developer
status: done
completed_at: 2026-08-20 11:52
---

# STEP 1.1: Chuyển đổi mã màu Account dropdown & popovers sang CSS tokens

## Nhiệm vụ
Thay thế các mã màu dark mode tĩnh (`bg-[#131826]`, `border-white/15`, `ring-black/50`, `bg-[#111520]`) bằng Tailwind CSS semantic tokens (`bg-surface`, `bg-surface-2`, `bg-surface-3`, `border-line`, `ring-line`) để tự động tương thích 100% với cả Dark Mode và Light Mode (`data-theme="light"`).

## Files đã sửa
1. `src/components/app-shell.tsx`:
   - User Profile Flyout Dropdown Menu (dòng 937): `border border-line bg-surface ring-1 ring-line space-y-3`
   - User Profile Avatar Border (dòng 940): `border border-line/50 shadow-md`
   - Settings Icon (dòng 969): `text-blue-500 dark:text-blue-400`
   - Project Switcher Dropdown Menu (dòng 559): `border border-line bg-surface ring-1 ring-line`
   - Mobile Drawer Sidebar (dòng 797): `bg-surface`
   - Mobile Bottom Navigation Bar (dòng 999): `bg-surface/95`
2. `src/app/projects/[projectId]/dashboard/page.tsx`:
   - Status Change Dropdown Menu (dòng 338): `border border-line bg-surface ring-1 ring-line`
3. `src/app/projects/[projectId]/all-projects/page.tsx`:
   - Quick Status Dropdown Menu (dòng 693): `border border-line bg-surface ring-1 ring-line`
4. `src/components/ui/tooltip.tsx`:
   - Tooltip content background (dòng 22): `border border-line bg-surface-3`

## Handoff Log
- Junior Developer đã hoàn tất thay thế toàn bộ mã màu dark mode tĩnh sang dynamic CSS variables tokens.
- Chuyển tiếp kết quả sang Tech Lead để review code và UX/UI Reviewer để kiểm tra giao diện.
