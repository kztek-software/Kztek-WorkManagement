---
step: 2.4
name: pages-responsive-optimization
agent: junior-developer
status: done
---

# STEP 2.4: Tối Ưu Các Phân Hệ Trang Chức Năng (Dashboard, Users, Sprints, Tickets, Reports, Settings, Portal)

## Mục tiêu
Tối ưu hóa layout và tương tác của toàn bộ các trang chức năng trên di động.

## Danh sách công việc
1. `dashboard/page.tsx`: Chuyển KPI grid thành `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`, cho phép cuộn dọc `overflow-y-auto`, biểu đồ thích ứng 100% width.
2. `users/page.tsx`: Hiện thanh Tab phân loại nhân sự/phòng ban/quyền hạn trên mobile (`overflow-x-auto`), cuộn ngang bảng phân quyền.
3. `sprints/page.tsx`: Thẻ sprint co giãn flex-col trên mobile, nút thao tác dễ bấm.
4. `tickets/ticket-list-view.tsx`: Bộ lọc co giãn, hỗ trợ xem dạng thẻ hoặc cuộn ngang bảng.
5. `reports/page.tsx`: Các lưới thống kê `grid-cols-1 lg:grid-cols-2` và biểu đồ responsive.
6. `settings/page.tsx`: Dải tab cuộn ngang không bị cắt chữ, form 1 cột trên mobile.
7. `portal/`: Tối ưu biểu mẫu tra cứu và gửi báo lỗi sự cố khách hàng.
