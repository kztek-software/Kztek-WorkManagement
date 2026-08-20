---
step: 1.1
name: prd-api-mobile-architecture
agent: product-manager
status: done
completed_at: 2026-08-18T20:52:10+07:00
---

# STEP 1.1: Phân Tích PRD & Đặc Tả Nghiệp Vụ REST API & Mobile App Avalonia

## 1. Bối cảnh & Mục tiêu Sản phẩm
Hệ sinh thái **KZTEK Work Management** đã hoàn thiện nền tảng Web App và Mobile Responsive Web (Phase 1 & Phase 2). Nhằm phục vụ tối đa nhu cầu của đội ngũ kỹ sư hiện trường, kỹ thuật viên triển khai dự án, quản lý công trường và khách hàng cần phản hồi nhanh, Phase 3 mở ra kênh ứng dụng di động bản địa (Native-feel Mobile App) sử dụng **C# Avalonia Cross-Platform**, đồng thời chuẩn hóa toàn bộ hệ thống **REST API** backend để làm cầu nối dữ liệu an toàn, tốc độ cao.

## 2. Phạm vi Nghiệp vụ (Scope of Work)

### 2.1. Nâng cấp & Chuẩn hóa REST API Backend
- **Xác thực Đa kênh (Dual-Channel Authentication)**:
  - Web: Cookie Session (`flowboard_session`).
  - Mobile App / REST Client: `Authorization: Bearer <jwt_token>`.
  - Endpoint `POST /api/auth/login`: Trả về JWT token trong response body cho Mobile App lưu trữ.
  - Endpoint `GET /api/auth/me`: Kiểm tra phiên làm việc và lấy thông tin cá nhân.
- **Danh mục API cốt lõi phục vụ Mobile**:
  - `GET /api/projects`: Lấy danh sách dự án của người dùng.
  - `GET /api/projects/[id]/tasks`: Lấy danh sách công việc theo dự án, hỗ trợ lọc theo trạng thái, độ ưu tiên, sprint.
  - `POST /api/projects/[id]/tasks`: Tạo mới công việc từ di động.
  - `GET /api/projects/[id]/tasks/[taskId]`: Lấy chi tiết công việc, subtasks checklist, bình luận, người phụ trách.
  - `PATCH /api/projects/[id]/tasks/[taskId]`: Cập nhật trạng thái, độ ưu tiên, người phụ trách.
  - `POST /api/projects/[id]/tasks/[taskId]/comments`: Thêm bình luận thảo luận.
  - `GET /api/tickets`: Danh sách phiếu báo lỗi khách hàng.
  - `GET /api/tickets/[ticketId]`: Chi tiết ticket và lịch sử xử lý.
  - `PATCH /api/tickets/[ticketId]`: Cập nhật trạng thái ticket và ghi chú xử lý.
  - `GET /api/notifications`: Danh sách thông báo cá nhân, số tin chưa đọc.
  - `PATCH /api/notifications/[id]`: Đánh dấu thông báo đã đọc.

### 2.2. Ứng dụng Di Động C# Avalonia (`KztekWorkManagement.Mobile`)
- **Môi trường & Công nghệ**: C# .NET / Avalonia UI XAML, tuân thủ mô hình MVVM (Model-View-ViewModel).
- **Trải nghiệm Người dùng Di động (Mobile-First UX)**:
  1. **Đăng nhập & Cấu hình máy chủ**: Đăng nhập nhanh bằng Email/Username & Mật khẩu. Hỗ trợ thay đổi địa chỉ IP/Domain máy chủ API linh hoạt.
  2. **Trang chủ & Tổng quan (Dashboard)**: Thống kê nhanh số việc cần làm (TODO), việc đang làm (IN PROGRESS), việc quá hạn, việc khẩn cấp.
  3. **Quản lý Dự án (Projects)**: Xem danh sách và chuyển đổi giữa các dự án đang tham gia.
  4. **Bảng Công việc (Kanban Board)**: Tab chuyển cột trạng thái nhanh, tìm kiếm từ khóa, lọc theo độ ưu tiên, nút chuyển trạng thái 1 chạm.
  5. **Chi tiết Công việc (Task Detail)**: Xem toàn bộ thông tin công việc, đánh dấu hoàn thành Subtasks, xem & gửi bình luận tức thì.
  6. **Tạo việc nhanh (Create Task)**: Form thêm việc trực quan với tiêu đề, mô tả, chọn sprint, độ ưu tiên và người làm.
  7. **Quản lý Báo lỗi Khách hàng (Customer Tickets)**: Theo dõi sự cố gửi về từ khách hàng, tra cứu mã ticket, cập nhật tiến độ xử lý.
  8. **Trung tâm Thông báo (Notifications)**: Nhận tin khi được giao việc, được tag @mention hoặc khi có thay đổi trạng thái.
  9. **Tài khoản & Cài đặt (Profile & Settings)**: Xem thông tin cá nhân, chuyển đổi Dark/Light mode, kiểm tra kết nối máy chủ, đăng xuất an toàn.

## 3. Tiêu chí Nghiệm thu (Acceptance Criteria - AC)
- **AC-1**: REST API nhận diện người dùng chính xác 100% qua header `Authorization: Bearer <token>`.
- **AC-2**: Toàn bộ luồng thao tác trên Mobile App hoạt động mượt mà, không bị giật lag, tự động lưu token sau khi đăng nhập.
- **AC-3**: Giao diện mang đúng nhận diện thương hiệu KZTEK (#251C53, #F05922), diện tích bấm $\ge 44px$.
- **AC-4**: Xử lý ngoại lệ kết nối mạng tốt (Network timeout, Invalid server URL, Token expired).

## Handoff Log
- **Người bàn giao**: Product Manager & Business Analyst
- **Người nhận**: UI/UX Designer & Tech Lead (STEP-1.2)
- **Ghi chú**: Đã chốt đầy đủ danh mục API và các phân hệ màn hình của Mobile App. Chuyển sang thiết kế Design System XAML, Token màu và Kiến trúc kỹ thuật.
