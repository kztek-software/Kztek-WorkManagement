---
step: 1.2
name: ux-ui-mobile-design-spec
agent: ui-ux-designer
status: done
completed_at: 2026-08-18T20:52:30+07:00
---

# STEP 1.2: Thiết Kế Kiến Trúc Mobile App Avalonia, Color Tokens & API Contracts

## 1. Hệ thống Nhận diện & Design Tokens XAML (Avalonia)
Đã chuẩn hóa bộ Resource Dictionary XAML (`BrandTokens.axaml`):
- **Brand Colors**:
  - `PrimaryBrush`: `#251C53` (KZTEK Deep Navy — Header, Thanh điều hướng, Button chính)
  - `AccentBrush`: `#F05922` (KZTEK Vivid Orange — Highlight badge, Trạng thái khẩn cấp, Nút hành động nổi)
  - `SurfaceBrush`: `#FFFFFF` (Light) / `#1E293B` (Dark)
  - `BackgroundBrush`: `#F8FAFC` (Light) / `#0F172A` (Dark)
  - `TextPrimary`: `#0F172A` (Light) / `#F8FAFC` (Dark)
  - `TextSecondary`: `#64748B`
  - `BorderBrush`: `#E2E8F0` / `#334155`
- **Priority Colors**:
  - Low: `#10B981` (Xanh lá)
  - Medium: `#3B82F6` (Xanh dương)
  - High: `#F59E0B` (Vàng cam)
  - Urgent: `#EF4444` (Đỏ rực)
- **Geometry & Metrics**:
  - Border CornerRadius: 12px (Cards), 8px (Badges & Buttons), 24px (Pills & Avatars).
  - Minimum Touch Height/Width: 44px $\times$ 44px.

## 2. Mô hình Kiến trúc Kỹ thuật MVVM C# Avalonia
- **Tầng Data/Models (DTOs)**: Định nghĩa POCO classes tương thích JSON deserialization (`System.Text.Json`).
- **Tầng Services**:
  - `ApiService`: Quản lý `HttpClient`, gán header `Authorization: Bearer <token>`, serialize/deserialize JSON, timeout 15s.
  - `AuthService`: Lưu trữ token trong bộ nhớ/secure store, kiểm tra trạng thái login.
  - `TaskService`, `ProjectService`, `TicketService`, `NotificationService`.
- **Tầng ViewModels**: Kế thừa `ObservableObject` / `ViewModelBase`, quản lý Command (`RelayCommand`), `IsBusy`, `ErrorMessage`, danh sách ObservableCollection.
- **Tầng Views**: XAML Controls thuần Avalonia, tối ưu hoá cho Touch interaction và Responsive layout.

## 3. Hợp đồng API
Đã hoàn thành và lưu trữ tại [REST-API-SPECIFICATION.md](file:///c:/Users/Flick/Desktop/kztek-work-management/docs/api/REST-API-SPECIFICATION.md).

## Handoff Log
- **Người bàn giao**: UI/UX Designer & Tech Lead
- **Người nhận**: Senior Developer (STEP-2.1 & STEP-2.2)
- **Ghi chú**: Đã hoàn tất đặc tả giao diện và hợp đồng API. Tiến hành nâng cấp Backend Next.js để hỗ trợ Bearer Auth và dựng dự án C# Avalonia.
