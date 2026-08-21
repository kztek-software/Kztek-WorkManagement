# STEP-1.2: Sửa package.json, Portal Page & Project-Specific Routing

## Thông tin bước
- **Thuộc plan:** `PLAN-fix-portal-styling-project-key-2026-08-20`
- **Người thực hiện:** Senior Developer
- **Trạng thái:** ✅ Hoàn thành

## Chi tiết các thay đổi
1. **`package.json`**: Xóa bỏ `"@tailwindcss/postcss": "^4"` để chuẩn hóa PostCSS 8 + Tailwind CSS 3.4.
2. **`src/app/portal/[projectKey]/page.tsx`**: Nhận `resolvedParams.projectKey` và truyền vào `CustomerPortalPage initialProjectKey={resolvedParams.projectKey}`.
3. **`src/app/portal/page.tsx`**:
   - Nhận prop `initialProjectKey?: string`.
   - Hiển thị badge dự án nếu có `initialProjectKey`.
   - Gắn `projectKey` vào payload POST gửi lên `/api/tickets/public`.
   - Fix typo placeholder thành "Ví dụ: Không thể xuất báo cáo...".

## Handoff Log
- Code đã được cập nhật và kiểm tra cú pháp thành công. Chuyển sang Tech Lead Review & UX/UI Reviewer.
