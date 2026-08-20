---
task: fix-high-disk-io-and-migrate-tickets-to-sql-server
created: 2026-08-19
updated: 2026-08-19
status: done
workflow: WF-BUGFIX
priority: P1
---

# PLAN MASTER: Khắc phục Đọc/Ghi Ổ Đĩa Cao & Hoàn tất Chuyển đổi Tickets sang SQL Server

## Mô tả
Tìm nguyên nhân gốc rễ và giải quyết triệt để tình trạng đọc/ghi ổ đĩa (Disk I/O) vẫn còn cao sau khi nâng cấp sang SQL Server.

## Root Cause Analysis
1. **Residual SQLite Database in `src/lib/tickets.ts`**: Module quản lý Tickets khách hàng (`src/lib/tickets.ts`) trước đó vẫn sử dụng trực tiếp `better-sqlite3` mở tệp `prisma/dev.db` ở chế độ WAL (`journal_mode = WAL`), khiến mọi thao tác đọc, viết ticket/bình luận/đính kèm vẫn tiếp tục ghi đĩa local thay vì đẩy lên SQL Server từ xa.
2. **Next.js Dev Server Churn (`next dev`)**: Máy chủ đang chạy `next dev -H 0.0.0.0 -p 3000` sử dụng Turbopack liên tục compile, reload, và ghi cache vào `.next/dev/build/chunks/` trên ổ đĩa.
3. **Giải pháp**:
   - Chuyển đổi 100% `src/lib/tickets.ts` sang sử dụng `prisma.customerTicket`, `prisma.ticketComment`, `prisma.attachment` kết nối SQL Server qua driver adapter `@prisma/adapter-mssql`.
   - Gỡ bỏ `better-sqlite3` khỏi module nghiệp vụ.
   - Hướng dẫn chế độ chạy tối ưu (`next build` & `next start`) để loại bỏ hoàn toàn việc compile/cache ghi đĩa của dev mode khi vận hành.

## Workflow: WF-BUGFIX
1. Step 1: QA Engineer / Senior Dev - Phân tích nguyên nhân gốc rễ & Process I/O
2. Step 2: Senior Developer - Refactor `src/lib/tickets.ts` sang Prisma SQL Server
3. Step 3: Tech Lead - Review code & bảo toàn toàn vẹn dữ liệu
4. Step 4: QA Engineer - Kiểm thử Tickets API & E2E Verification
5. Step 5: Dispatcher tổng kết & giải thích chi tiết cho người dùng

## Steps
| # | Bước | Agent | Status | Hoàn thành lúc |
|---|------|-------|--------|-----------------|
| 1.1 | Phân tích root cause & process I/O | QA Engineer / Senior Dev | ✅ | 2026-08-19 11:26 |
| 2.1 | Refactor `src/lib/tickets.ts` sang Prisma SQL Server | Senior Developer | ✅ | 2026-08-19 11:27 |
| 3.1 | Code review & kiểm tra kiến trúc | Tech Lead | ✅ | 2026-08-19 11:27 |
| 4.1 | Kiểm thử Tickets API & E2E Verification | QA Engineer | ✅ | 2026-08-19 11:28 |
| 5.1 | Tổng kết & hướng dẫn vận hành tối ưu disk I/O | Dispatcher | ✅ | 2026-08-19 11:29 |
