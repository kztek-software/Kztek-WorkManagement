# STEP 3.2 — Tech Lead Review, UX/UI Review & QA Verification

## Nhiệm vụ
- Kiểm tra tính hoàn thiện của UI/UX: xem chi tiết sprint, đổi trạng thái, thêm việc, gỡ việc, mở task dialog, xem thống kê Story Points và phân bổ nhân sự.
- Đảm bảo responsive, màu sắc đồng bộ chuẩn theme KZTEK Dark/Light, không có lỗi runtime/compile.

## Verification Checklist
- [x] Click vào thẻ Sprint trên trang `/projects/[projectId]/sprints` mở ngay `SprintDetailDialog`.
- [x] Nút "Chi tiết Sprint" và hiệu ứng hover phản hồi nhanh, trực quan.
- [x] Hiển thị chính xác tiến độ Story Points (hoàn thành / tổng points / % bar).
- [x] Hiển thị phân bổ công việc theo nhân sự (Workloads) kèm avatar và thanh tiến độ.
- [x] Bộ lọc theo trạng thái (Tất cả / Cần làm / Đang làm / Đã xong) và tìm kiếm công việc trong sprint hoạt động trơn tru.
- [x] Đổi trạng thái nhanh cho công việc trong Sprint cập nhật database ngay lập tức.
- [x] Bấm vào bất kỳ công việc nào mở `TaskDialog` đầy đủ (xem subtasks, bình luận mention @, đính kèm ảnh/video).
- [x] Chức năng "Gán việc từ Backlog" hỗ trợ tìm kiếm và chọn nhiều việc để đưa vào sprint trong 1 click.
- [x] Nút "Mở trên Board" điều hướng sang Board với bộ lọc Sprint tương ứng.
- [x] Chức năng Chỉnh sửa thông tin Sprint (Tên, Mục tiêu, Ngày bắt đầu / kết thúc) hoạt động chuẩn xác.
- [x] Chức năng Xóa Sprint an toàn, tự động hoàn trả tasks về Backlog (`sprintId: null`).
- Trạng thái: ✅ PASS toàn bộ tiêu chí.
