# STEP 2.1 — Xây dựng component SprintDetailDialog

## Nhiệm vụ
Tạo `src/components/sprint/sprint-detail-dialog.tsx`:
- Giao diện Modal/Dialog chi tiết Sprint chuẩn UI KZTEK Design.
- Header: Tên Sprint, Trạng thái (ACTIVE / PLANNING / COMPLETED), Mục tiêu, Thời hạn và Thời lượng.
- Các nút hành động: Kích hoạt Sprint, Hoàn thành / Đóng Sprint, Sửa thông tin, Xóa Sprint, Mở trên Board, Thêm việc mới, Gán việc từ Backlog.
- KPI & Metric Cards: Story Points (Hoàn thành / Còn lại / Tổng), Thống kê công việc theo trạng thái, Breakdown theo Priority và Type, Phân bổ công việc cho từng thành viên (Member Workload).
- Danh sách công việc trong Sprint: Tabs lọc theo trạng thái, tìm kiếm nhanh, đổi trạng thái trực tiếp, gỡ task khỏi sprint.
- Tích hợp click vào công việc để mở `TaskDialog` trực tiếp.
