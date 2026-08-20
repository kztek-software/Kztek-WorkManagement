---
task: system-config-db-persistence
created: 2026-08-20
updated: 2026-08-20
status: done
workflow: WF-FEATURE
priority: P1
---

# PLAN MASTER: Lưu Trữ Cấu Hình Hệ Thống (SystemSetting) vào Bảng Cơ Sở Dữ Liệu SQL Server

> File này CHỈ chứa tổng quan + trạng thái. Chi tiết từng bước nằm ở `steps/STEP-[N.M]-[tên].md` tương ứng.

## Mô tả
Tạo bảng `SystemSetting` trong SQL Server thông qua Prisma ORM và nâng cấp module `src/lib/system-config.ts` để đọc/ghi cấu hình trực tiếp từ CSDL. Giúp hệ thống giữ nguyên toàn bộ cấu hình SMTP, thương hiệu đơn vị, email, domain hệ thống khi restart service, restart container hoặc redeploy.

## Nguồn yêu cầu
- Yêu cầu gốc: "SystemConfig: Cần có bảng lưu lại tránh mỗi lần restart service lại phải cài lại"
- Workflow: WF-FEATURE — Tính năng mới / Nâng cấp cốt lõi
- Agent chain: PM → Tech Lead → Senior Developer → QA Engineer

## Phases & Steps

### Phase 1: Database Schema & Migration
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 1.1 | Định nghĩa model `SystemSetting` trong `prisma/schema.prisma`, chạy `db push` & `generate` | Senior Developer | ✅ | `steps/STEP-1.1-db-schema.md` | 2026-08-20 13:42 |

### Phase 2: Logic Persistence & API Upgrade
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 2.1 | Nâng cấp `src/lib/system-config.ts` hỗ trợ DB persistence, auto-seed và memory caching | Senior Developer | ✅ | `steps/STEP-2.1-config-persistence.md` | 2026-08-20 13:43 |
| 2.2 | Cập nhật API route `src/app/api/system/config/route.ts` sử dụng async DB handlers | Senior Developer | ✅ | `steps/STEP-2.2-api-route.md` | 2026-08-20 13:43 |

### Phase 3: Verification & Review
| # | Bước | Agent | Status | Step file | Hoàn thành lúc |
|---|------|-------|--------|-----------|-----------------|
| 3.1 | QA & TL Verification: Kiểm thử lưu cấu hình vào SQL Server, kiểm tra độ bền dữ liệu qua restart | QA Engineer | ✅ | `steps/STEP-3.1-verification.md` | 2026-08-20 13:46 |

## Artifacts tạo ra
- [x] `prisma/schema.prisma`
- [x] `src/lib/system-config.ts`
- [x] `src/app/api/system/config/route.ts`
- [x] `code-graph/CODE-GRAPH.md`

## Blockers
Không có
