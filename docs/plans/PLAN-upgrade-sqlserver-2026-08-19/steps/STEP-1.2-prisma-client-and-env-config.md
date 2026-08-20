# STEP 1.2: Cập nhật Prisma Client Instance & Biến Môi trường (.env)

## Mục tiêu
- Tạo file `.env` và `.env.example` chứa chuỗi kết nối:
  `DATABASE_URL="sqlserver://14.160.26.45:9999;database=WorkingManager;user=vietanh;password=Kztek123456;encrypt=true;trustServerCertificate=true;"`
- Cập nhật `src/lib/prisma.ts` để sử dụng native Prisma Client kết nối trực tiếp qua `DATABASE_URL` thay vì adapter SQLite.
- Cập nhật `package.json` các script `db:push`, `db:seed`, `setup`.
