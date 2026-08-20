---
step: 1.1
plan: PLAN-customer-ticket-pagination-2026-08-20
agent: Senior Developer
status: done
completed: 2026-08-20 14:43
---

# STEP-1.1: Tích hợp PrimeReact Paginator & slicing logic trong `TicketListView`

## Kết quả thực hiện
- Import `Paginator`, `type PaginatorPageChangeEvent` từ `primereact/paginator`.
- Bổ sung state `first` (mặc định 0), `rows` (mặc định 10).
- Tích hợp effect tự động reset `first = 0` khi thay đổi `scopeFilter`, `statusFilter`, `priorityFilter`, `typeFilter`, hoặc `search`.
- Tạo `paginatedTickets` qua `useMemo` và map danh sách các hàng hiển thị trên bảng.
- Thêm thanh điều khiển phân trang đẹp mắt ở cuối bảng `TicketListView` với:
  - Tóm tắt bản ghi `Hiển thị X - Y trên tổng số Z ticket`.
  - Bộ chọn `rowsPerPageOptions={[5, 10, 20, 50]}`.
  - Các nút phân trang (First, Prev, Page numbers, Next, Last) đồng bộ theme.
- Chạy type-check `npx tsc --noEmit` hoàn thành với **0 lỗi**.
