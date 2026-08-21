# STEP-1.1: Triage & Root Cause Diagnosis

## Thông tin bước
- **Thuộc plan:** `PLAN-fix-portal-styling-project-key-2026-08-20`
- **Người thực hiện:** Senior Developer / QA Engineer
- **Trạng thái:** ✅ Hoàn thành

## Kết quả chẩn đoán
1. **Hiện tượng:** Truy cập `http://192.168.21.48:3000/portal/DEMO` hiển thị giao diện thuần HTML thô (unstyled) không có style Tailwind và PrimeReact.
2. **Nguyên nhân gốc (Root Cause):**
   - Sự hiện diện của `@tailwindcss/postcss: ^4` trong `devDependencies` gây xung đột với bộ cấu hình PostCSS 8 + Tailwind CSS v3 (`tailwindcss: ^3.4.17`).
   - Dev server Turbopack trên Windows biên dịch ban đầu bị nghẽn (30s-60s per route), trình duyệt nhận HTML trước khi CSS chunk hoàn tất.
   - Khi Turbopack hoàn tất build bundle, CSS chunk `0kcf6x2mvakxw.css` được phân phối và trả lời HTTP 200 OK.
   - Trang `/portal/[projectKey]` chỉ render component con mà không truyền param `projectKey`.
   - Có lỗi chính tả nhỏ trong placeholder tiêu đề ticket: "Ví dụ: Không thể xuất báo các".

## Handoff Log
- Đã xác định toàn bộ các điểm cần sửa chữa trong `package.json`, `src/app/portal/page.tsx`, `src/app/portal/[projectKey]/page.tsx`.
