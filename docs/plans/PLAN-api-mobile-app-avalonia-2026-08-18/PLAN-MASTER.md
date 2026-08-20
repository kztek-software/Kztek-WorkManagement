---
task: api-mobile-app-avalonia
created: 2026-08-18
updated: 2026-08-18
status: completed
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Giai đoạn 3 (GD3) — Mở REST API & Xây Dựng Ứng Dụng Mobile C# Avalonia

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mục tiêu
Triển khai toàn diện Giai đoạn 3 (Phase 3) cho hệ thống KZTEK Work Management:
1. **Mở & Hoàn thiện Hệ thống REST API Backend**:
   - Nâng cấp cơ chế xác thực JWT hỗ trợ song song Cookie (Web) và `Authorization: Bearer <token>` (Mobile Client).
   - Cung cấp toàn bộ REST API endpoints cho Mobile App: Auth, User Profile, Projects, Kanban Tasks, Sprints, Subtasks, Comments, Customer Tickets, Notifications, File Upload.
   - Tài liệu hóa đặc tả API rõ ràng và kịch bản kiểm thử API tự động.

2. **Xây dựng Ứng dụng Mobile Hoàn chỉnh bằng C# Avalonia (Cross-Platform)**:
   - Xây dựng ứng dụng di động chuẩn MVVM (.NET / Avalonia UI) hỗ trợ đa nền tảng (Android, iOS, Windows, macOS, Linux).
   - Thiết kế giao diện Mobile-first mang đậm nhận diện thương hiệu KZTEK (Xanh navy `#251C53`, Cam `#F05922`, Card nổi bo góc, Typography chuẩn mực, Touch targets $\ge 44px$).
   - 9 Màn hình chức năng di động:
     1. `LoginView`: Đăng nhập, lưu trữ Token bảo mật, ghi nhớ phiên, tùy chỉnh API Server Endpoint.
     2. `DashboardView`: Thống kê KPI công việc, việc cần làm gấp, việc được giao, thanh tìm kiếm nhanh.
     3. `ProjectsView`: Danh sách & chuyển đổi dự án làm việc linh hoạt.
     4. `KanbanBoardView`: Xem công việc theo cột trạng thái, lọc theo độ ưu tiên/sprint, thao tác chuyển trạng thái nhanh.
     5. `TaskDetailView`: Chi tiết công việc, toggle subtasks checklist, xem & gửi bình luận thảo luận.
     6. `CreateTaskView`: Biểu mẫu tạo mới công việc nhanh, gán người thực hiện, độ ưu tiên, sprint.
     7. `TicketsView`: Quản lý báo lỗi khách hàng (Customer Tickets), tra cứu mã tracking, cập nhật xử lý.
     8. `NotificationsView`: Trung tâm thông báo di động, đếm số tin chưa đọc, đánh dấu đã đọc.
     9. `SettingsView`: Thông tin cá nhân, cấu hình URL Server kết nối (Localhost/LAN/Cloud), Đăng xuất.

## Phân công thực hiện (Chain of Command)

| Phase | Bước | Agent | Nội dung | Status | Step file |
|---|---|---|---|---|---|
| Phase 1 | 1.1 | Product Manager & BA | Phân tích PRD & Đặc tả nghiệp vụ REST API & Mobile App Avalonia | ✅ | `steps/STEP-1.1-prd-api-mobile-architecture.md` |
| Phase 1 | 1.2 | UI/UX Designer & Tech Lead | Thiết kế kiến trúc Mobile App Avalonia, Color Tokens, XAML Component Spec & API Contracts | ✅ | `steps/STEP-1.2-ux-ui-mobile-design-spec.md` |
| Phase 2 | 2.1 | Senior Developer | Mở REST API Backend: Hỗ trợ Bearer Token Auth, Route Handlers & Integration Verification | ✅ | `steps/STEP-2.1-rest-api-bearer-auth.md` |
| Phase 2 | 2.2 | Senior Developer | Khởi tạo Project C# Avalonia Mobile: Models, Base MVVM, ApiService, Storage & State Management | ✅ | `steps/STEP-2.2-avalonia-core-services-models.md` |
| Phase 2 | 2.3 | Senior Developer | Xây dựng Core Views & ViewModels: Login, Shell App, Dashboard, Projects, Kanban Board, Task Detail & Create Task | ✅ | `steps/STEP-2.3-avalonia-mvvm-views-viewmodels.md` |
| Phase 2 | 2.4 | Junior Developer | Xây dựng Secondary Views: TicketsView, NotificationsView, SettingsView & Custom Controls (KzCard, KzBadge, KzBottomNav) | ✅ | `steps/STEP-2.4-avalonia-tickets-notifications-settings.md` |
| Phase 3 | 3.1 | UX/UI Reviewer | Đánh giá trải nghiệm UI/UX di động theo 7 tiêu chí C1–C7 trên giao diện Avalonia | ✅ | `steps/STEP-3.1-ux-ui-review-mobile-app.md` |
| Phase 3 | 3.2 | QA Engineer & QA Lead | Chạy kiểm thử tự động toàn diện REST API, xác minh luồng End-to-End Mobile App & Ký duyệt nghiệm thu (Sign-off) | ✅ | `steps/STEP-3.2-qa-verification-signoff.md` |

## Artifacts theo dõi
- Backend API: `src/lib/auth.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/me/route.ts`, `src/app/api/projects/route.ts`, `src/app/api/tickets/route.ts`
- Mobile C# Project: `mobile/KztekWorkManagement.Mobile/`
- Documentation: `docs/api/REST-API-SPECIFICATION.md`, `mobile/README.md`
- Verification script: `scripts/test-mobile-api-e2e.js`
