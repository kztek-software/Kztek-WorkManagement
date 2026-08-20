# 📱 KZTEK Work Management — Ứng Dụng Mobile C# Avalonia

Ứng dụng di động đa nền tảng (Cross-Platform Mobile App) cho hệ thống **KZTEK Work Management**, được phát triển bằng **C# và Avalonia UI (XAML & MVVM)**.

---

## 🌟 Tính Năng Cốt Lõi

1. **Xác thực & Kết nối Máy chủ Linh hoạt (`LoginView` & `SettingsView`)**:
   - Đăng nhập bảo mật qua JWT Token (`Authorization: Bearer <token>`).
   - Tự động lưu phiên làm việc.
   - Tùy chỉnh API Endpoint kết nối linh hoạt (máy ảo Android `10.0.2.2:3000`, mạng LAN nội bộ hoặc Cloud).
2. **Bảng điều khiển Tổng quan (`DashboardView`)**:
   - Thống kê 4 khối KPI: Việc cần làm (TODO), Đang làm (IN PROGRESS), Đã xong (DONE), Việc khẩn cấp (URGENT).
   - Danh sách việc được giao và việc ưu tiên cao cần xử lý gấp.
3. **Quản lý & Chuyển đổi Dự án (`ProjectsView`)**:
   - Tra cứu và chuyển đổi giữa các dự án đang tham gia.
4. **Bảng Công việc Kanban (`KanbanBoardView`)**:
   - Chuyển tab trạng thái nhanh ngón tay cái (Thumb Zone).
   - Nút chuyển tiếp trạng thái 1 chạm.
   - Tìm kiếm và lọc theo mức độ ưu tiên.
5. **Chi tiết & Thảo luận Công việc (`TaskDetailView`)**:
   - Xem toàn bộ thông tin công việc, người làm, hạn chót.
   - Đánh dấu hoàn thành danh sách việc nhỏ (Subtasks Checklist).
   - Xem & gửi bình luận tức thì.
6. **Tạo việc nhanh (`CreateTaskView`)**:
   - Thêm nhanh công việc ngay tại công trường hoặc hiện trường triển khai.
7. **Quản lý Báo lỗi Khách hàng (`TicketsView`)**:
   - Theo dõi danh sách sự cố khách hàng gửi về, tra cứu mã ticket, cập nhật trạng thái xử lý.
8. **Trung tâm Thông báo Di động (`NotificationsView`)**:
   - Xem thông báo, đếm số tin chưa đọc và đánh dấu đã đọc.

---

## 🏗️ Kiến Trúc Mã Nguồn (Architecture)

```
KztekWorkManagement.Mobile/
├── App.axaml & App.axaml.cs       # Khởi tạo App, ResourceDictionary & AppLifetime
├── Program.cs                     # Entry point
├── Common/                        # MVVM Base Classes & XAML Converters
│   ├── ObservableObject.cs        # INotifyPropertyChanged base
│   ├── RelayCommand.cs            # ICommand implementation
│   └── Converters.cs              # Status/Priority/Color converters
├── Models/                        # Data Transfer Objects (DTOs)
│   ├── User.cs & AuthResponse.cs
│   ├── Project.cs
│   ├── TaskItem.cs & Subtask.cs & CommentItem.cs
│   └── CustomerTicket.cs & NotificationItem.cs
├── Services/                      # Tầng Dịch Vụ REST API & HTTP Client
│   ├── ApiService.cs              # HttpClient với Bearer token header
│   ├── AuthService.cs             # Quản lý phiên đăng nhập & State
│   └── DomainServices.cs          # ProjectService, TaskService, TicketService, NotificationService
├── ViewModels/                    # Tầng ViewModels MVVM
│   ├── MainViewModel.cs           # Điều hướng Shell di động (Bottom Navigation)
│   ├── LoginViewModel.cs
│   ├── DashboardAndProjectsViewModel.cs
│   ├── KanbanAndDetailViewModel.cs
│   └── SecondaryAndMainViewModels.cs
├── Views/                         # Giao diện XAML
│   ├── MainView.axaml             # Shell di động: Header, ContentHost, BottomNav
│   ├── LoginView.axaml
│   ├── DashboardView.axaml
│   ├── ProjectsView.axaml
│   ├── KanbanBoardView.axaml
│   ├── TaskDetailView.axaml
│   ├── CreateTaskView.axaml
│   ├── TicketsView.axaml
│   ├── NotificationsView.axaml
│   └── SettingsView.axaml
└── Styles/                        # Nhận diện Thương hiệu KZTEK
    ├── BrandTokens.axaml          # Bảng màu #251C53, #F05922, Typography, Radius
    └── AppStyles.axaml            # Button, Card, Input, Badge Styles
```

---

## 🚀 Hướng Dẫn Chạy & Biên Dịch (Build & Run)

### 1. Yêu cầu Môi trường
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) hoặc mới hơn.
- IDE: Visual Studio 2022 / Rider / VS Code với Avalonia Extension.

### 2. Chạy Ứng dụng trên Desktop (Mô phỏng kích thước điện thoại 412x860)
```bash
cd mobile/KztekWorkManagement.Mobile
dotnet build
dotnet run
```

### 3. Build cho Android
```bash
dotnet publish -f net8.0-android -c Release
```

### 4. Build cho iOS
```bash
dotnet publish -f net8.0-ios -c Release
```
