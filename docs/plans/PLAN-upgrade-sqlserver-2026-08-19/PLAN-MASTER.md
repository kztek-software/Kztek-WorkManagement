---
task: upgrade-database-to-sql-server
created: 2026-08-19
updated: 2026-08-19
status: done
workflow: WF-REFACTOR
priority: P1
---

# PLAN MASTER: Nâng cấp Cơ sở Dữ liệu từ SQLite sang Microsoft SQL Server

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
Nâng cấp toàn bộ hệ thống lưu trữ dữ liệu của KZTEK Work Management từ SQLite (`prisma/dev.db`) sang Microsoft SQL Server (`14.160.26.45:9999`, DB `WorkingManager`, User `vietanh`).
Bao gồm:
1. Cấu hình Prisma Schema sang `provider = "sqlserver"` tương thích toàn diện (kiểu dữ liệu NVARCHAR(MAX) cho text dài/JSON, quan hệ khóa ngoại không gây cascade loop trong SQL Server).
2. Thiết lập `.env` chuẩn hóa chuỗi kết nối và cập nhật `src/lib/prisma.ts` kết nối trực tiếp native Prisma Client qua driver adapter `@prisma/adapter-mssql` và `mssql`.
3. Đồng bộ schema lên cơ sở dữ liệu `WorkingManager` trên máy chủ SQL Server `14.160.26.45:9999` (16 bảng).
4. Viết script di chuyển dữ liệu (Data Migration) chuyển toàn bộ dữ liệu hiện hữu từ SQLite sang SQL Server (Users, Teams, Roles, Projects, Members, Sprints, Tasks, Labels, Comments, Activities, Subtasks, CustomerTickets, TicketComments, Attachments, Notifications) — 100% khớp số lượng bản ghi.
5. Kiểm thử toàn diện API, xác thực đăng nhập, truy vấn dữ liệu và cập nhật `CODE-GRAPH.md`.

## Nguồn yêu cầu
- Yêu cầu gốc: "Nâng cấp DB thành SQL Server \n 14.160.26.45,9999 \n vietanh \n Kztek123456"
- Workflow: WF-REFACTOR — Nâng cấp kiến trúc DB & Chuyển đổi hệ quản trị CSDL
- Agent chain: Tech Lead (Kiến trúc & TDD) → Senior Developer (Code & Migration) → Tech Lead (Review) → QA Engineer (Verify)

## Phases & Steps

### Phase 1: Kiến trúc CSDL & Cấu hình Prisma SQL Server
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Cập nhật `prisma/schema.prisma` sang provider `sqlserver` với các kiểu dữ liệu và quan hệ tương thích SQL Server | Tech Lead / Senior Dev | ✅ | `steps/STEP-1.1-schema-and-adapter-upgrade.md` | 2026-08-19 09:14 |
| 1.2 | Cập nhật `src/lib/prisma.ts`, `package.json` và tạo `.env` chứa chuỗi kết nối SQL Server | Senior Developer | ✅ | `steps/STEP-1.2-prisma-client-and-env-config.md` | 2026-08-19 09:17 |

### Phase 2: Triển khai Schema & Di chuyển Dữ liệu (Data Migration)
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Đẩy cấu trúc bảng lên SQL Server (`WorkingManager`) và generate Prisma Client mới | Senior Developer | ✅ | `steps/STEP-2.1-db-push-and-generate.md` | 2026-08-19 09:18 |
| 2.2 | Viết và chạy script di chuyển toàn bộ dữ liệu SQLite hiện tại sang SQL Server | Senior Developer | ✅ | `steps/STEP-2.2-data-migration-script.md` | 2026-08-19 09:28 |

### Phase 3: Kiểm thử Toàn diện & Bàn giao
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | Kiểm thử toàn diện các API routes, xác thực tài khoản, tra cứu ticket và task | QA Engineer | ✅ | `steps/STEP-3.1-verification-and-testing.md` | 2026-08-19 09:42 |
| 3.2 | Cập nhật `code-graph/CODE-GRAPH.md` và hoàn tất handoff | Tech Lead | ✅ | `steps/STEP-3.2-code-graph-update.md` | 2026-08-19 09:43 |

## Artifacts hoàn thành (tổng)
- [x] `prisma/schema.prisma`
- [x] `prisma.config.ts`
- [x] `src/lib/prisma.ts`
- [x] `.env` & `.env.example`
- [x] `package.json`
- [x] `scripts/migrate-sqlite-to-sqlserver.ts`
- [x] `scripts/test_e2e_sqlserver.ts`
- [x] `code-graph/CODE-GRAPH.md`

## Blockers
Không có. Toàn bộ 16 bảng và 100% dữ liệu đã di chuyển sang SQL Server thành công, Next.js build và E2E Test toàn bộ PASS.
