# CODE-GRAPH.md — Bản đồ codebase: KZTEK Multi-Agent Workspace
**Cập nhật lần cuối:** 2026-08-19 | **Bởi:** senior-developer | **Version:** 2.2

> File này được duy trì tự động bởi coding agents.
> **Đọc file này TRƯỚC khi đọc source code** để hiểu cấu trúc dự án mà không cần mở từng file.

---

## Tổng quan dự án

Hệ thống quản lý công việc và dự án toàn diện **KZTEK Work Management**:
- **Backend & Web App**: Next.js 16 (App Router), React 19, TailwindCSS, Prisma ORM 7, **Microsoft SQL Server (`14.160.26.45:9999`, DB `WorkingManager`)** via `@prisma/adapter-mssql`.
- **Desktop Web Workstation (Phase 4)**: Không gian làm việc máy tính chuyên dụng (`/desktop`), Dual-Pane Split View, Global Command Palette (`Ctrl+K`), Shortcuts Hub, Smart Work Calculator (Story Points, Sprint Capacity, KPI, Office Calc), Desktop Scratchpad, Desktop PWA Standalone Mode (`manifest.json`).
- **Mobile Client (Phase 3)**: C# .NET 8 / Avalonia UI XAML (Cross-platform Android, iOS, Windows, macOS, Linux).
- **Agent Orchestration**: Gemini Agent Framework (`.gemini/`, GEMINI.md, RULES.md, WORKFLOW.md).

---

## Cấu trúc thư mục

```
kztek-work-management/
├── src/                         ← Next.js App Router (Backend APIs & Web Frontend)
│   ├── app/
│   │   ├── api/                 ← REST API Endpoints (auth, projects, tasks, tickets, notifications, upload)
│   │   ├── desktop/             ← Desktop Workstation Portal (/desktop)
│   │   ├── mobile/              ← Mobile Web Simulator
│   │   └── projects/            ← Project Pages (dashboard, board, sprints, tickets, users, reports, settings)
│   ├── components/
│   │   ├── desktop/             ← Desktop Components (SplitView, StatusBar, CommandPalette, Shortcuts, SmartCalc, Scratchpad)
│   │   ├── app-shell.tsx        ← Root Application Shell & Global Keybindings
│   │   └── board/               ← Kanban Board Components
│   ├── lib/                     ← Utilities, Auth, DB Client (PrismaMssql), Permissions & Domain Services
│   └── generated/prisma/        ← Prisma Client Generated for SQL Server
├── public/
│   └── manifest.json            ← Desktop PWA Manifest (Standalone Mode & Desktop Shortcuts)
├── mobile/                      ← C# Avalonia Mobile Application (Cross-Platform)
├── docs/                        ← Tài liệu kỹ thuật, API Specs & Plans
│   └── plans/
│       ├── PLAN-upgrade-sqlserver-2026-08-19/ ← Plan Nâng cấp CSDL Microsoft SQL Server
│       └── PLAN-desktop-web-app-2026-08-18/   ← Plan Master & Steps Phase 4
├── scripts/                     ← Automation, Migration & Verification scripts (migrate-sqlite-to-sqlserver.ts, test_e2e_sqlserver.ts)
└── GEMINI.md                    ← Quy tắc điều phối Multi-Agent KZTEK
```

---

## Module chính

| Tên Module | Đường dẫn | Chức năng chính | Files liên quan |
|---|---|---|---|
| Database & ORM Engine (SQL Server) | `prisma/`, `src/lib/prisma.ts`, `prisma.config.ts` | Kết nối CSDL quan hệ Microsoft SQL Server (`WorkingManager`), Driver Adapter `PrismaMssql`, 16 bảng dữ liệu toàn diện | `prisma/schema.prisma`, `src/lib/prisma.ts`, `prisma.config.ts`, `.env` |
| Desktop Web Workstation (Phase 4) | `src/app/desktop/`, `src/components/desktop/` | Giao diện làm việc máy tính chuyên dụng, Dual-Pane Split-View (50:50, 65:35), System Status Bar, Global Command Palette (`Ctrl+K`), Shortcuts Hub, PWA Standalone | `page.tsx`, `desktop-split-view.tsx`, `desktop-status-bar.tsx`, `command-palette.tsx`, `shortcuts-modal.tsx`, `manifest.json` |
| Smart Work Calculator Suite | `src/components/desktop/smart-work-calculator.tsx` | Bộ công cụ máy tính năng suất: Máy tính số học, Ước lượng Sprint Capacity & Story Points (Fibonacci), KPI & Chi phí | `smart-work-calculator.tsx`, `desktop-scratchpad.tsx` |
| C# Avalonia Mobile App | `mobile/KztekWorkManagement.Mobile/` | Ứng dụng di động đa nền tảng (Android/iOS/Desktop) chuẩn MVVM, nhận diện thương hiệu KZTEK, 9 màn hình chức năng | `MainView.axaml`, `LoginView.axaml`, `DashboardView.axaml`, `KanbanBoardView.axaml`, `ApiService.cs`, `BrandTokens.axaml` |
| REST API & Bearer Auth | `src/lib/auth.ts`, `src/app/api/` | Hệ thống REST API chuẩn RFC 6750 hỗ trợ song song Bearer Token JWT và Cookie Session | `src/lib/auth.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/tickets/route.ts`, `src/app/api/projects/route.ts` |
| Custom Roles & Permission Matrix | `src/app/api/roles/`, `src/app/projects/[projectId]/users/page.tsx` | Quản trị vai trò tùy ý (Custom Roles), ma trận phân quyền hệ thống & dự án | `src/lib/permissions-server.ts`, `src/app/api/roles/route.ts` |
| Sprint Detail Hub & Management | `src/components/sprint/sprint-detail-dialog.tsx` | Trung tâm Chi tiết Sprint, Thống kê Story Points, Gán việc từ Backlog | `src/components/sprint/sprint-detail-dialog.tsx`, `src/app/api/projects/[id]/sprints/` |
| Customer Tickets Hub | `src/lib/tickets.ts`, `src/app/api/tickets/` | Cổng tiếp nhận và xử lý phiếu báo lỗi khách hàng | `src/lib/tickets.ts`, `src/app/api/tickets/route.ts` |
| Notification Center & Mail | `src/components/notifications/`, `src/lib/mail.ts` | Trung tâm thông báo đa năng và gửi Email thông báo tự động | `src/lib/mail.ts`, `src/lib/notifications.ts`, `src/app/api/notifications/` |

---

## Lịch sử Thay đổi (Change Log)

| Ngày | File/Module | Loại | Mô tả ngắn | Agent |
|------|------------|------|------------|-------|
| 2026-08-19 | `prisma/schema.prisma`, `src/lib/prisma.ts`, `prisma.config.ts`, `.env`, `scripts/migrate-sqlite-to-sqlserver.ts`, `scripts/test_e2e_sqlserver.ts` | Refactor/Upgrade | Nâng cấp toàn diện CSDL từ SQLite sang Microsoft SQL Server (`14.160.26.45:9999`, Database `WorkingManager`). Tối ưu kiểu dữ liệu NVARCHAR(MAX), chống chu trình Cascade (Error 1785), cấu hình adapter `@prisma/adapter-mssql`, di chuyển 100% dữ liệu SQLite hiện có (Users, Teams, Roles, Projects, Tasks, Tickets, Attachments, Notifications) và chạy E2E Test toàn bộ PASS. | tech-lead, senior-developer, qa-engineer |
| 2026-08-18 | `prisma/schema.prisma`, `src/components/board/task-card.tsx`, `src/components/board/sortable-task-card.tsx`, `src/app/projects/[projectId]/board/page.tsx`, `mobile/.../Views/KanbanBoardView.axaml`, `TicketsView.axaml`, `NotificationsView.axaml` | Optimization | Tối ưu hóa toàn diện hiệu năng tải dữ liệu & kết xuất giao diện (31 Performance Indexes cho SQLite, React.memo cho TaskCard/SortableTaskCard, Dynamic Lazy Loading Dialogs, Skeleton Loading UI, useDeferredValue cho search filter, và Virtualized ListBox trên C# Avalonia Mobile App) | tech-lead, senior-developer, qa-engineer |
| 2026-08-18 | `src/app/desktop/`, `src/components/desktop/`, `public/manifest.json`, `src/components/app-shell.tsx`, `scripts/test-desktop-web-app-e2e.js` | Feature (Phase 4) | Triển khai toàn diện Giai đoạn 4: Ứng dụng máy tính dạng Web App (Desktop Workstation Portal `/desktop`, Dual-Pane Split View, Command Palette `Ctrl+K`, Shortcuts Hub `?`, Smart Work Calculator đa năng, Desktop Scratchpad, Desktop PWA Manifest, E2E Test 33/33 PASS) | senior-developer, junior-developer, ux-ui-reviewer, qa-engineer |
| 2026-08-18 | `mobile/KztekWorkManagement.Mobile/`, `src/lib/auth.ts`, `src/app/api/tickets/route.ts`, `docs/api/REST-API-SPECIFICATION.md` | Feature (Phase 3) | Mở toàn diện REST API hỗ trợ xác thực Bearer Token JWT; Dựng ứng dụng di động hoàn chỉnh C# Avalonia Mobile (9 màn hình MVVM, Design System KZTEK, Services, E2E Test 18/18 PASS) | senior-developer & qa-engineer |
| 2026-08-18 | `src/components/app-shell.tsx`, `src/app/projects/[projectId]/board/page.tsx` | Feature (Phase 2) | Tối ưu hóa toàn diện Web chạy hoàn hảo trên điện thoại di động (Mobile Responsive Web, Drawer, Bottom Nav) | senior-developer |
| 2026-08-18 | `tasks/route.ts`, `tickets/route.ts`, `dispatch/route.ts`, `task-card.tsx` | Audit/Fix | Rà soát toàn diện dự án: sửa import, hỗ trợ alias targetProjectId, defensive null checks | qa-engineer |
| 2026-08-18 | `permissions-context.tsx`, `permissions-server.ts`, `app-shell.tsx` | Fix/Add | Cập nhật phân quyền thời gian thực, kiểm tra đa lớp API routes | senior-developer |
