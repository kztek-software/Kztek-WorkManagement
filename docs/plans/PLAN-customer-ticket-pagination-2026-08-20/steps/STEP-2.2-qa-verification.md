---
step: 2.2
plan: PLAN-customer-ticket-pagination-2026-08-20
agent: QA Engineer / DevOps
status: done
completed: 2026-08-20 14:45
---

# STEP-2.2: QA Smoke Test & DevOps Ready

## Kịch bản kiểm thử (QA Smoke Test)
1. **Hiển thị mặc định**: Bảng hiển thị 10 bản ghi/trang đầu tiên; thanh tóm tắt hiển thị "Hiển thị 1 - X trên tổng số Y ticket".
2. **Chuyển trang**: Bấm nút trang tiếp theo (Next/Page 2) -> dữ liệu chuyển trang mượt mà, đúng danh sách ticket của trang tương ứng.
3. **Thay đổi Rows per page**: Đổi sang 5 hoặc 20 ticket/trang -> bảng cập nhật số lượng dòng và tính lại tổng số trang chính xác.
4. **Bộ lọc & Tìm kiếm**: Chuyển sang tab "Chờ Admin Điều Phối", đổi trạng thái hoặc nhập từ khóa tìm kiếm -> trang tự động nhảy về trang 1.
5. **Mở Drawer**: Nhấp vào bất kỳ hàng ticket nào trên các trang vẫn mở Drawer chi tiết chính xác.

## DevOps Sign-off
- Sẵn sàng phát hành.
