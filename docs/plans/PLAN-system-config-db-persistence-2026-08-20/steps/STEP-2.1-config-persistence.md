# STEP 2.1 — Nâng cấp `src/lib/system-config.ts` hỗ trợ DB persistence

## Mục tiêu
Tích hợp Prisma Client để đọc/ghi cấu hình vào bảng `SystemSetting` trong SQL Server, hỗ trợ cả API bất đồng bộ và đồng bộ qua memory cache, backup file JSON cục bộ.

## Trạng thái
⬜ Chưa bắt đầu
