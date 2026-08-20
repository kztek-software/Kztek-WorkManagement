---
task: customer-ticket-pagination
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FASTTRACK
priority: P2
---

# PLAN MASTER: Bổ Sung Phân Trang (Pagination) Cho Hộp Thư Ticket Khách Hàng

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## 1. Mô tả yêu cầu
- Bảng danh sách Customer Tickets (`TicketListView`) đang hiển thị toàn bộ danh sách ticket trong một view duy nhất mà không có thanh phân trang.
- Cần bổ sung phân trang với số lượng dòng tùy chọn (5, 10, 20, 50 tickets/trang), có tóm tắt số bản ghi và nút điều hướng trang mượt mà.

## 2. Giải pháp kỹ thuật
- Tích hợp component `Paginator` từ thư viện `primereact/paginator` với giao diện Dark & Light theme đã tinh chỉnh trong `globals.css`.
- Quản lý state phân trang: `first` (mặc định 0), `rows` (mặc định 10).
- Tự động reset về trang 1 (`first = 0`) khi người dùng thay đổi bộ lọc hoặc tìm kiếm.
- Cắt lát dữ liệu hiển thị `paginatedTickets = tickets.slice(first, first + rows)`.
- Hiển thị thanh phân trang đẹp mắt ở cuối bảng với text tóm tắt bản ghi và dropdown chọn số lượng dòng.

---

## 3. Phases & Steps

### Phase 1: Triển khai Pagination UI
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Tích hợp PrimeReact Paginator & slicing logic trong `TicketListView` | Senior Developer | ✅ | `steps/STEP-1.1-pagination.md` | 2026-08-20 14:43 |

### Phase 2: Review, UX & Verification
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Code Review & UX/UI Review trên Light & Dark mode | Tech Lead / UX-UI Reviewer | ✅ | `steps/STEP-2.1-review-and-ux.md` | 2026-08-20 14:44 |
| 2.2 | QA Smoke Test & DevOps Ready | QA Engineer / DevOps | ✅ | `steps/STEP-2.2-qa-verification.md` | 2026-08-20 14:45 |

---

## 4. Artifacts đã cập nhật
- [x] `src/components/tickets/ticket-list-view.tsx`
