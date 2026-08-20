---
step: 2.2
name: avalonia-core-services-models
agent: senior-developer
status: done
completed_at: 2026-08-18T20:58:05+07:00
---

# STEP 2.2: Khởi Tạo Project C# Avalonia Mobile: Models, Base MVVM, ApiService, Storage & State Management

## 1. Kết quả thực hiện
- Khởi tạo cấu trúc project `.NET / Avalonia` hoàn chỉnh: `KztekWorkManagement.Mobile.csproj`.
- Xây dựng tầng MVVM Base:
  - `ObservableObject.cs`: Cơ chế thông báo thay đổi `INotifyPropertyChanged`.
  - `RelayCommand.cs`: Command binding linh hoạt hỗ trợ generics và canExecute.
  - `Converters.cs`: Bộ chuyển đổi giao diện XAML (`StatusToBrushConverter`, `PriorityToColorConverter`, `BooleanToVisibilityConverter`, `StringToInitialsConverter`).
- Xây dựng tầng Data Models (DTOs):
  - `User.cs`, `AuthResponse.cs`
  - `Project.cs`, `ProjectsResponse.cs`
  - `TaskItem.cs`, `Subtask.cs`, `CommentItem.cs`, `Sprint.cs`, `TasksResponse.cs`
  - `CustomerTicket.cs`, `NotificationItem.cs`, `TicketsResponse.cs`, `NotificationsResponse.cs`
- Xây dựng tầng Dịch Vụ (Services):
  - `IApiService` / `ApiService`: Giao tiếp HTTP REST API, cấu hình BaseUrl động, tự động gán Bearer Token, timeout, JSON serialization.
  - `IAuthService` / `AuthService`: Quản lý phiên đăng nhập và sự kiện `AuthStateChanged`.
  - `IProjectService` / `ProjectService`: Lấy danh sách và tạo mới dự án.
  - `ITaskService` / `TaskService`: Quản lý Task, chuyển trạng thái và gửi bình luận.
  - `ITicketService` / `TicketService`: Quản lý báo lỗi khách hàng.
  - `INotificationService` / `NotificationService`: Thông báo cá nhân.

## Handoff Log
- **Người bàn giao**: Senior Developer
- **Người nhận**: Senior Developer & Junior Developer (STEP-2.3 & STEP-2.4)
- **Ghi chú**: Tầng Models và Services đã hoàn tất và kết nối thông suốt với REST API backend. Tiến hành dựng ViewModels và Views.
