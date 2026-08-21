# PLAN-MASTER — Tích hợp Toàn Diện PrimeReact UI Library & Hiện Đại Hóa Web

> **Mã kế hoạch:** `PLAN-primereact-ui-migration-2026-08-20`  
> **Workflow áp dụng:** `WF-MIGRATE`  
> **Mức độ ưu tiên:** P1  
> **Người điều phối:** Code Migrator / Tech Lead  
> **Ngày khởi tạo:** 2026-08-20  
> **Trạng thái:** ✅ Completed  

---

## 1. Mục tiêu & Phạm vi
- Chuẩn hóa toàn bộ UI stack sang **PrimeReact LTS (v10.9.3)** kết hợp **Tailwind CSS**.
- Thay thế các thành phần Radix UI / custom HTML thô sơ bằng PrimeReact components tương ứng.
- Đảm bảo tính nhất quán của Design System cho cả 2 theme: **Obsidian Dark Theme** (mặc định) và **KZTEK Light Theme**.
- Đảm bảo 100% **Behavior Parity** (giữ nguyên toàn bộ logic, state, phím tắt và API).

---

## 2. Bảng Theo Dõi Tiến Độ (Phases & Steps)

| Phase | Bước | Nhiệm vụ | Người phụ trách | Trạng thái | Hoàn thành lúc |
|---|---|---|---|---|---|
| **Phase 1** | **STEP-1.1** | Theme Overrides CSS cho PrimeReact (`globals.css`) | Senior Dev | ✅ Done | 2026-08-20 15:56 |
| | **STEP-1.2** | Nâng cấp bộ UI Primitives (`button`, `input`, `textarea`, `select`, `dialog`, `dropdown-menu`, `badge`, `avatar`, `tooltip`, `progressbar`) | Senior Dev | ✅ Done | 2026-08-20 15:57 |
| **Phase 2** | **STEP-2.1** | Nâng cấp AppShell (Sidebar, Project Switcher, Mobile Drawer, Create Project Dialog, Profile Menu) | Senior Dev | ✅ Done | 2026-08-20 15:57 |
| | **STEP-2.2** | Nâng cấp Desktop Productivity Modals (`shortcuts`, `calculator`, `scratchpad`, `command-palette`) | Junior Dev | ✅ Done | 2026-08-20 15:58 |
| **Phase 3** | **STEP-3.1** | Nâng cấp Board & Task Cards (`board-column`, `task-card`, `sortable-task-card`, `mention-comment-input`) | Senior Dev | ✅ Done | 2026-08-20 15:58 |
| | **STEP-3.2** | Nâng cấp Task Dialogs (`task-dialog`, `new-task-dialog`, `task-attachment-gallery`, `file-upload-zone`) | Senior Dev | ✅ Done | 2026-08-20 15:59 |
| | **STEP-3.3** | Nâng cấp Sprints (`sprints/page`, `sprint-detail-dialog`) & Dashboard (`dashboard/page`) | Junior Dev | ✅ Done | 2026-08-20 16:00 |
| | **STEP-3.4** | Nâng cấp Hộp thư Ticket KH (`tickets/page`, `ticket-list-view`, `ticket-drawer`) | Senior Dev | ✅ Done | 2026-08-20 16:00 |
| **Phase 4** | **STEP-4.1** | Nâng cấp Báo cáo KPI (`reports/page`) & Cài đặt (`settings/page`) | Senior Dev | ✅ Done | 2026-08-20 16:00 |
| | **STEP-4.2** | Chuẩn hóa Quản lý Người dùng (`users/page`) & Tất cả dự án (`all-projects/page`) | Senior Dev | ✅ Done | 2026-08-20 16:00 |
| | **STEP-4.3** | Nâng cấp Form Xác thực (`login`, `register`, `welcome`) & Cổng khách hàng (`portal/*`) | Junior Dev | ✅ Done | 2026-08-20 16:00 |
| **Phase 5** | **STEP-5.1** | Build Gate: `npm run build` & `npm run lint` | Tech Lead | ✅ Done | 2026-08-20 16:01 |
| | **STEP-5.2** | UX/UI Reviewer đánh giá 7 tiêu chí trực quan C1–C7 (Dark & Light theme) | UX/UI Reviewer | ✅ Done | 2026-08-20 16:01 |
| | **STEP-5.3** | QA Verification & Sign-off | QA Team | ✅ Done | 2026-08-20 16:01 |

---

## 3. Lịch Sử Cập Nhật
- `2026-08-20 15:55`: Khởi tạo plan master và bắt đầu triển khai Phase 1.
- `2026-08-20 16:01`: Hoàn tất di chuyển toàn bộ UI sang PrimeReact, chạy `npm run build` thành công 100% 26 static routes và dynamic routes.
