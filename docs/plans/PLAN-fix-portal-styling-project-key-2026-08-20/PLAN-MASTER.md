---
task: fix-portal-styling-and-project-key
created: 2026-08-20
updated: 2026-08-20
status: in_progress
workflow: WF-BUGFIX
priority: P2
---

# PLAN MASTER: Khắc Phục Lỗi Giao Diện Customer Portal Bị Vỡ Layout (Unstyled HTML) & Hỗ Trợ Định Tuyến /portal/[projectKey]

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở steps/STEP-[N.M]-[tên].md tương ứng.

## 1. Mô tả vấn đề
- Khách hàng/người dùng khi truy cập `http://192.168.21.48:3000/portal/DEMO` thấy giao diện bị rơi vào trạng thái unstyled HTML (các thẻ text, link xanh, nút bấm, input xếp chồng dạng thô, không áp dụng Tailwind CSS & PrimeReact styles).
- **Nguyên nhân gốc (Root Cause):**
  1. Trong `package.json`, tồn tại dependency `@tailwindcss/postcss: ^4` (Tailwind v4) trong khi dự án đang chạy Tailwind v3.4.17 (`tailwindcss: ^3.4.17`, `@tailwind base;`), gây xung đột phân giải plugin PostCSS khi Next.js build stylesheet.
  2. Dev server Turbopack trên Windows bị lag/compilation delay dẫn tới việc client load HTML trước khi bundle CSS chunk hoàn tất.
  3. Trang `src/app/portal/[projectKey]/page.tsx` chưa truyền `projectKey` vào `CustomerPortalPage`, dẫn tới trang portal không hiển thị badge dự án và không gắn `projectKey` khi submit ticket.
  4. Lỗi chính tả trong placeholder tiêu đề ticket: "Ví dụ: Không thể xuất báo các".

## 2. Giải pháp kỹ thuật
1. **package.json:** Gỡ bỏ `@tailwindcss/postcss: ^4` khỏi `devDependencies` để chuẩn hóa 100% stack PostCSS 8 + Tailwind CSS 3.4.
2. **src/app/portal/page.tsx:**
   - Hỗ trợ prop `initialProjectKey?: string`.
   - Hiển thị badge dự án mục tiêu (nếu truy cập qua `/portal/[projectKey]`).
   - Tự động gắn `projectKey` vào payload khi submit `/api/tickets/public`.
   - Sửa lỗi chính tả placeholder thành "Ví dụ: Không thể xuất báo cáo...".
3. **src/app/portal/[projectKey]/page.tsx:**
   - Truyền `initialProjectKey={resolvedParams.projectKey}` xuống component con.
4. **Kiểm thử & Xác nhận:**
   - Kiểm tra `curl` và HTTP response trên cổng LAN `192.168.21.48:3000/portal/DEMO`.
   - Đảm bảo các stylesheet chunk (Tailwind + PrimeReact + Geist) load đầy đủ `200 OK`.

---

## 3. Phases & Steps

### Phase 1: Chẩn đoán & Sửa Code (Triage & Fix)
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Triage, xác định root cause CSS vỡ & dependency conflict | Senior Developer | ✅ | steps/STEP-1.1-triage-diagnose.md | 2026-08-20 |
| 1.2 | Sửa package.json, portal page.tsx & [projectKey]/page.tsx | Senior Developer | 🔄 | steps/STEP-1.2-fix-portal-and-package.md | 2026-08-20 |

### Phase 2: Review, Verification & Smoke Test
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Tech Lead Review & UX/UI Reviewer đánh giá trực quan | Tech Lead / UX-UI Reviewer | ⬜ | steps/STEP-2.1-techlead-review-and-ux.md | 2026-08-20 |
| 2.2 | QA Verification & DevOps Test | QA Engineer / DevOps Engineer | ⬜ | steps/STEP-2.2-qa-verify.md | 2026-08-20 |

---

## 4. Artifacts hoàn thành
- [x] package.json
- [x] src/app/portal/page.tsx
- [x] src/app/portal/[projectKey]/page.tsx
- [x] docs/plans/PLAN-fix-portal-styling-project-key-2026-08-20/PLAN-MASTER.md
