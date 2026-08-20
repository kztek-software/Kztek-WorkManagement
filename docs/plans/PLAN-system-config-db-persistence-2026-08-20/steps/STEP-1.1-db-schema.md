# STEP 1.1 — Định nghĩa Model `SystemSetting` trong `prisma/schema.prisma`

## Mục tiêu
Tạo bảng `SystemSetting` trong SQL Server để lưu trữ cấu hình hệ thống bao gồm: SMTP, Thương hiệu & Đơn vị, Quy tắc thông báo.

## Kế hoạch thực hiện
1. Thêm model `SystemSetting` vào `prisma/schema.prisma`.
2. Chạy `npx prisma db push` để tạo bảng trên SQL Server.
3. Chạy `npx prisma generate` để cập nhật Prisma Client.

## Trạng thái
🔄 Đang thực hiện
