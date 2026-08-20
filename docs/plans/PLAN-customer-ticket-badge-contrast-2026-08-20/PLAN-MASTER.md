---
task: customer-ticket-badge-contrast
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FASTTRACK
priority: P3
---

# PLAN MASTER: Cải Thiện Độ Tương Phản Màu Huy Hiệu "Chờ Điều Phối" & Bộ Lọc Ticket Khách Hàng

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## 1. Mô tả vấn đề
- Huy hiệu **"Chờ điều phối"** trên bảng danh sách Customer Tickets (`TicketListView`) và Drawer chi tiết (`TicketDrawer`) đang dùng `text-amber-400` với nền sáng (`bg-amber-500/20`), khi hiển thị ở giao diện sáng (Light Theme) chữ bị chói, nhạt nhòa và rất khó đọc (tỷ lệ tương phản chỉ ~1.38:1, vi phạm tiêu chuẩn tương phản màu WCAG AA).
- Tương tự, tab bộ lọc **"Chờ Admin Điều Phối"** và bộ đếm số lượng unassigned tickets cũng đang dùng các class `text-amber-400`, `hover:text-amber-300` gây khó nhìn trên nền sáng.

## 2. Giải pháp kỹ thuật
- Điều chỉnh màu sắc cho badge **"Chờ điều phối"**:
  - Light mode: Nền `bg-amber-500/15`, viền `border-amber-400/50`, chữ `text-amber-800` (độ tương phản cao, dễ đọc trên nền sáng), icon `text-amber-700`.
  - Dark mode: Nền `dark:bg-amber-500/20`, viền `dark:border-amber-500/40`, chữ `dark:text-amber-300`, icon `dark:text-amber-400`.
  - Thêm padding/font-weight cân đối (`px-2.5 py-0.5 font-bold text-[11px]`).
- Điều chỉnh tab bộ lọc **"Chờ Admin Điều Phối"** (`TicketListView`):
  - Áp dụng `text-amber-700 dark:text-amber-400` cho active state và `hover:text-amber-700 dark:hover:text-amber-300` khi hover.
  - Badge counter dùng `bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-400/50 dark:border-amber-500/30`.
- Đồng bộ hóa huy hiệu trong `TicketDrawer` (`ticket-drawer.tsx`).

---

## 3. Phases & Steps

### Phase 1: Triển khai sửa đổi UI & Độ tương phản
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Cập nhật CSS/Tailwind classes độ tương phản cao cho `ticket-list-view.tsx` & `ticket-drawer.tsx` | Junior Developer | ✅ | `steps/STEP-1.1-fix-badge-contrast.md` | 2026-08-20 14:34 |

### Phase 2: Review, Verification & Smoke Test
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Code Review & UX/UI Review độ tương phản Light/Dark | Tech Lead / UX-UI Reviewer | ✅ | `steps/STEP-2.1-review-and-ux.md` | 2026-08-20 14:35 |
| 2.2 | QA Smoke Test & DevOps Ready | QA Engineer / DevOps | ✅ | `steps/STEP-2.2-qa-smoke-test.md` | 2026-08-20 14:36 |

---

## 4. Artifacts đã cập nhật
- [x] `src/components/tickets/ticket-list-view.tsx`
- [x] `src/components/tickets/ticket-drawer.tsx`
