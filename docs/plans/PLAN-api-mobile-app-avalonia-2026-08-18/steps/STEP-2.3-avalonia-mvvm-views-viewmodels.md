---
step: 2.3
name: avalonia-mvvm-views-viewmodels
agent: senior-developer
status: done
completed_at: 2026-08-18T21:01:38+07:00
---

# STEP 2.3: Xây Dựng Core Views & ViewModels: Login, Shell App, Dashboard, Projects, Kanban Board, Task Detail & Create Task

## 1. Kết quả thực hiện
- `MainView.axaml` & `MainViewModel.cs`:
  - Thiết kế App Shell di động: Top Header hiển thị tiêu đề động, nhận diện thương hiệu KZTEK, chuông thông báo có đếm số tin chưa đọc.
  - Thanh điều hướng ngón tay cái dưới đáy màn hình (Bottom Navigation Bar) gồm 5 tab chức năng: Tổng quan, Bảng việc, Báo lỗi, Thông báo, Cài đặt.
  - Hệ thống DataTemplates tự động render View tương ứng với ViewModel.
- `LoginView.axaml` & `LoginViewModel.cs`:
  - Form đăng nhập chuẩn UX di động, hỗ trợ đổi Server URL, hiển thị thông báo lỗi, tự động lưu token sau khi xác thực.
- `DashboardView.axaml` & `DashboardViewModel.cs`:
  - 4 khối thẻ KPI (TODO, IN PROGRESS, DONE, URGENT) màu sắc trực quan.
  - Danh sách việc khẩn cấp và việc được giao cá nhân.
- `ProjectsView.axaml` & `ProjectsViewModel.cs`:
  - Tìm kiếm và chọn dự án làm việc.
- `KanbanBoardView.axaml` & `KanbanBoardViewModel.cs`:
  - Thanh tab chuyển đổi nhanh cột trạng thái (Thumb Zone).
  - Tìm kiếm và lọc theo độ ưu tiên.
  - Nút chuyển nhanh trạng thái 1 chạm.
- `TaskDetailView.axaml` & `TaskDetailViewModel.cs`:
  - Xem chi tiết, danh sách subtasks checklist, thảo luận bình luận.
- `CreateTaskView.axaml` & `CreateTaskViewModel.cs`:
  - Form thêm mới công việc nhanh.

## Handoff Log
- **Người bàn giao**: Senior Developer
- **Người nhận**: Junior Developer (STEP-2.4) & UX/UI Reviewer (STEP-3.1)
- **Ghi chú**: Toàn bộ Core Views & ViewModels đã hoàn tất.
