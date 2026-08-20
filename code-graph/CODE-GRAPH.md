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
| Universal SWR Tab Cache & Prefetching | `src/lib/tab-cache.ts`, `src/components/app-shell.tsx` | Hệ thống Client Cache Stale-While-Revalidate (SWR) toàn cục, khử trùng lặp request (deduping), hover prefetching và đồng bộ tức thì (< 10ms) giữa các tab | `src/lib/tab-cache.ts`, `src/components/app-shell.tsx`, `board/page.tsx`, `dashboard/page.tsx`, `sprints/page.tsx`, `reports/page.tsx` |
| Database & ORM Engine (SQL Server) | `prisma/`, `src/lib/prisma.ts`, `prisma.config.ts` | Kết nối CSDL quan hệ Microsoft SQL Server (`WorkingManager`), Driver Adapter `PrismaMssql`, 17 bảng dữ liệu (Users, Teams, Roles, Projects, Sprints, Tasks, Labels, Subtasks, Comments, Activities, Tickets, TicketComments, Attachments, Notifications, SystemSetting) | `prisma/schema.prisma`, `src/lib/prisma.ts`, `prisma.config.ts`, `.env` |
| System Configuration & Persistence | `src/lib/system-config.ts`, `src/app/api/system/config/` | Quản trị và lưu trữ cấu hình hệ thống (SMTP, Thương hiệu đơn vị, Thông báo, Base URL) bền vững trong bảng CSDL `SystemSetting` (SQL Server), tự động đồng bộ cache in-memory và backup đĩa | `src/lib/system-config.ts`, `src/app/api/system/config/route.ts`, `src/lib/mail.ts`, `src/app/projects/[projectId]/settings/page.tsx` |
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

| 2026-08-20 | `src/app/layout.tsx`, `src/app/globals.css` | Fix/Scroll-UI | Khắc phục triệt để lỗi không thể cuộn trang trên Cổng Báo Cáo Sự Cố & Hỗ Trợ Kỹ Thuật (`/portal`, `/portal/[projectKey]`, `/portal/tickets/*`) và các trang công cộng: Gỡ bỏ class `overflow-hidden` trên thẻ `<body>` trong `src/app/layout.tsx`, chuyển sang `min-h-full flex flex-col`, đồng thời tối ưu `globals.css` sử dụng `min-height: 100%` linh hoạt giúp thanh cuộn viewport hoạt động mượt mà tự nhiên, bảo toàn 100% trải nghiệm của Desktop AppShell và Workstation. | senior-developer, tech-lead, ux-ui-reviewer, qa-engineer |
| 2026-08-20 | `src/lib/tab-cache.ts`, `src/components/app-shell.tsx`, `board/page.tsx`, `dashboard/page.tsx`, `sprints/page.tsx`, `reports/page.tsx`, `notification-bell.tsx` | Optimization/Perf | Triển khai hệ thống Universal SWR Client Cache (`useTabCache`), Request Deduplication và Hover Prefetching trên thanh điều hướng; chuyển đổi toàn bộ màn hình (Board, Dashboard, Sprints, Báo Cáo) sang cơ chế Stale-While-Revalidate giúp thời gian chuyển tab phản hồi tức thì (< 10ms / 0s perceived latency) trên bản Production, đồng thời đảm bảo dữ liệu luôn chính xác 100% qua background revalidation & cache mutation. | senior-developer, tech-lead, qa-engineer |
| 2026-08-20 | `src/lib/auth.ts`, `src/app/api/auth/*`, `next.config.ts`, `KZTEK-Work.cmd`, `package.json` | Fix/Auth-LAN | Khắc phục triệt để lỗi máy khác trong mạng LAN không sử dụng được sau khi đăng nhập: Điều chỉnh cờ cookie `secure: process.env.COOKIE_SECURE === "true"` (thay vì cố định theo production) để trình duyệt không reject cookie qua HTTP LAN; mở rộng wildcard `allowedDevOrigins` (`192.168.*`, `10.*`, `172.*`) và gắn cờ host binding `-H 0.0.0.0` khi chạy máy chủ. | senior-developer, tech-lead, qa-engineer, devops-engineer |
| 2026-08-20 | `src/components/board/task-dialog.tsx`, `src/components/board/mention-comment-input.tsx` | Fix/UI | Tối ưu hóa giao diện Task Dialog: Tách ô chọn Hạn chót (`type="date"`) và Điểm ước lượng thành các hàng độc lập chiếm trọn chiều rộng (`w-full px-3 h-8.5`), triệt tiêu hoàn toàn lỗi bị xén đè viền ô ngày tháng; Nâng cấp hàm `RenderCommentContent` nhận diện chính xác 100% nguyên cụm họ tên tiếng Việt có dấu cách (VD: `@Nguyễn Trung Kiên`) thành một badge gắn thẻ hoàn chỉnh, không còn bị ngắt cụm chỉ bôi màu chữ đầu tiên. | junior-developer, tech-lead, ux-ui-reviewer, qa-engineer |
| 2026-08-20 | `src/app/projects/[projectId]/reports/page.tsx` | Fix/UI | Căn phải toàn bộ tiêu đề cột (`<th>`) và ô số liệu (`<td>`) trong bảng "Ma trận So sánh Năng suất Nhân sự Toàn đội" (Tổng việc, Hoàn thành, Đang làm, Quá hạn, Points, Tỉ lệ hoàn thành) kết hợp font monospaced (`font-mono`) giúp quét mắt so sánh số liệu dễ dàng và chuẩn xác. | junior-developer, tech-lead, ux-ui-reviewer, qa-engineer |
| 2026-08-20 | `src/components/board/board-column.tsx`, `src/app/projects/[projectId]/board/page.tsx`, `src/app/api/projects/[projectId]/tickets/[ticketId]/convert/route.ts` | Fix/UI | Tinh chỉnh giao diện Kanban Board tự động co giãn 100% bề ngang (`flex-1 min-w-[240px] md:min-w-[260px]`), cân đối hai lề đối xứng hoàn hảo (`px-3 sm:px-4 md:px-5`), triệt tiêu hoàn toàn khoảng trống thừa bên phải; Đồng bộ hóa luồng gửi Thông báo & Email SMTP khi chuyển đổi Ticket thành Task. | junior-developer, tech-lead, ux-ui-reviewer, qa-engineer |
| 2026-08-20 | `src/components/board/task-card.tsx`, `src/lib/notifications.ts`, `src/app/api/projects/[projectId]/tasks/[taskId]/route.ts`, `src/app/api/projects/[projectId]/tasks/route.ts` | Fix/Feature | Chuẩn hóa toàn diện kích thước thẻ Task đồng đều (`min-h-[142px]`, Title slot `min-h-[38px]`, Label slot `min-h-[22px]`, Footer ghim đáy `mt-auto`) đảm bảo tất cả thẻ 1 dòng/2 dòng, có nhãn/không nhãn đều thẳng tắp; Gỡ bỏ hoàn toàn điều kiện chặn `assigneeId !== user.id` giúp kích hoạt đầy đủ Thông báo In-App CSDL và Email HTML qua SMTP cho cả thao tác tự nhận việc và giao việc cho thành viên. | junior-developer, tech-lead, ux-ui-reviewer, qa-engineer |
| 2026-08-20 | `src/components/board/task-card.tsx`, `src/app/projects/[projectId]/board/page.tsx` | Fix/UI | Tối ưu hóa toàn diện giao diện Kanban Board: Đồng bộ hóa chiều cao tối thiểu cho toàn bộ thẻ task (`min-h-[120px] sm:min-h-[124px]`, tiêu đề chuẩn `min-h-[36px] line-clamp-2`, chân trang ghim đáy `mt-auto`) giúp các thẻ 1 dòng/không nhãn và 2 dòng có nhãn đều cân đối nhịp thị giác; Bổ sung `pr-6 sm:pr-8 md:pr-10` và spacer element ở cuối thanh cuộn ngang giúp cột 'HOÀN THÀNH' luôn có khoảng đệm (margin phải) thoáng đãng, không bị dính sát mép màn hình. | junior-developer, tech-lead, ux-ui-reviewer, qa-engineer |
| 2026-08-20 | `prisma/schema.prisma`, `src/lib/system-config.ts`, `src/app/api/system/config/route.ts` | Feature/Persistence | Tạo bảng `SystemSetting` trong SQL Server database qua Prisma ORM, nâng cấp `system-config.ts` và API `/api/system/config` lưu trữ và đồng bộ bền vững vào CSDL, chống mất cấu hình (SMTP, Thương hiệu, Thông báo, App URL) khi restart service/redeploy. | tech-lead, senior-developer, qa-engineer |
| 2026-08-20 | `src/components/board/task-dialog.tsx` | Fix/UI | Tối ưu hóa toàn diện giao diện Task Dialog: Khắc phục triệt để lỗi tràn chiều cao và cắt khung bình luận chân trang (sticky composer) bằng cấu trúc Flexbox/Grid chuẩn `h-[90vh] flex flex-col`, phân tách rành mạch vùng cuộn nội dung và thanh nhập bình luận; tích hợp component `RenderMarkdownDescription` kết xuất trực quan cú pháp Markdown cho mô tả chi tiết, hỗ trợ chuyển đổi linh hoạt giữa chế độ Xem và Sửa. | junior-developer, tech-lead, ux-ui-reviewer, qa-engineer |
| 2026-08-20 | `src/components/app-shell.tsx`, `src/app/projects/[projectId]/dashboard/page.tsx`, `src/app/projects/[projectId]/all-projects/page.tsx`, `src/components/ui/tooltip.tsx` | Fix/UI | Đồng bộ hóa toàn diện Chế độ sáng (Light Theme) cho Flyout Menu Tài khoản người dùng (Account popover), Dropdown chọn Dự án, Dropdown trạng thái và Mobile navigation; loại bỏ hoàn toàn các mã màu dark mode tĩnh (`bg-[#131826]`, `bg-[#111520]`) thay bằng CSS tokens (`bg-surface`, `bg-surface-2`, `bg-surface-3`, `border-line`, `ring-line`). | junior-developer, tech-lead, ux-ui-reviewer |
| 2026-08-20 | `src/app/projects/[projectId]/dashboard/page.tsx` | UI/Refactor | Tinh chỉnh giao diện DashboardView: Tăng độ cao hệ thống nút điều khiển Header (`h-8.5`/`h-9`), chuyển nút 'Chi tiết' Sprint thành nút bấm nổi bật, cân bằng kích thước 2 hàng 4 panel bằng CSS Grid (`lg:grid-rows-2`), và căn phải các cột số liệu trong bảng Năng suất Nhân sự. | junior-developer, tech-lead, ux-ui-reviewer |
| 2026-08-19 | `prisma/schema.prisma`, `src/lib/prisma.ts`, `prisma.config.ts`, `.env`, `scripts/migrate-sqlite-to-sqlserver.ts`, `scripts/test_e2e_sqlserver.ts` | Refactor/Upgrade | Nâng cấp toàn diện CSDL từ SQLite sang Microsoft SQL Server (`14.160.26.45:9999`, Database `WorkingManager`). Tối ưu kiểu dữ liệu NVARCHAR(MAX), chống chu trình Cascade (Error 1785), cấu hình adapter `@prisma/adapter-mssql`, di chuyển 100% dữ liệu SQLite hiện có (Users, Teams, Roles, Projects, Tasks, Tickets, Attachments, Notifications) và chạy E2E Test toàn bộ PASS. | tech-lead, senior-developer, qa-engineer |
| 2026-08-18 | `prisma/schema.prisma`, `src/components/board/task-card.tsx`, `src/components/board/sortable-task-card.tsx`, `src/app/projects/[projectId]/board/page.tsx`, `mobile/.../Views/KanbanBoardView.axaml`, `TicketsView.axaml`, `NotificationsView.axaml` | Optimization | Tối ưu hóa toàn diện hiệu năng tải dữ liệu & kết xuất giao diện (31 Performance Indexes cho SQLite, React.memo cho TaskCard/SortableTaskCard, Dynamic Lazy Loading Dialogs, Skeleton Loading UI, useDeferredValue cho search filter, và Virtualized ListBox trên C# Avalonia Mobile App) | tech-lead, senior-developer, qa-engineer |
| 2026-08-18 | `src/app/desktop/`, `src/components/desktop/`, `public/manifest.json`, `src/components/app-shell.tsx`, `scripts/test-desktop-web-app-e2e.js` | Feature (Phase 4) | Triển khai toàn diện Giai đoạn 4: Ứng dụng máy tính dạng Web App (Desktop Workstation Portal `/desktop`, Dual-Pane Split View, Command Palette `Ctrl+K`, Shortcuts Hub `?`, Smart Work Calculator đa năng, Desktop Scratchpad, Desktop PWA Manifest, E2E Test 33/33 PASS) | senior-developer, junior-developer, ux-ui-reviewer, qa-engineer |
| 2026-08-18 | `mobile/KztekWorkManagement.Mobile/`, `src/lib/auth.ts`, `src/app/api/tickets/route.ts`, `docs/api/REST-API-SPECIFICATION.md` | Feature (Phase 3) | Mở toàn diện REST API hỗ trợ xác thực Bearer Token JWT; Dựng ứng dụng di động hoàn chỉnh C# Avalonia Mobile (9 màn hình MVVM, Design System KZTEK, Services, E2E Test 18/18 PASS) | senior-developer & qa-engineer |
| 2026-08-18 | `src/components/app-shell.tsx`, `src/app/projects/[projectId]/board/page.tsx` | Feature (Phase 2) | Tối ưu hóa toàn diện Web chạy hoàn hảo trên điện thoại di động (Mobile Responsive Web, Drawer, Bottom Nav) | senior-developer |
| 2026-08-18 | `tasks/route.ts`, `tickets/route.ts`, `dispatch/route.ts`, `task-card.tsx` | Audit/Fix | Rà soát toàn diện dự án: sửa import, hỗ trợ alias targetProjectId, defensive null checks | qa-engineer |
| 2026-08-18 | `permissions-context.tsx`, `permissions-server.ts`, `app-shell.tsx` | Fix/Add | Cập nhật phân quyền thời gian thực, kiểm tra đa lớp API routes | senior-developer |

