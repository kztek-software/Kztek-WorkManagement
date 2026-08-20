# STEP 1.1: Cập nhật Prisma Schema sang SQL Server

## Mục tiêu
- Cập nhật `prisma/schema.prisma` sang `datasource db { provider = "sqlserver" url = env("DATABASE_URL") }`.
- Điều chỉnh các trường dữ liệu kiểu chuỗi dài (description, permissions JSON, internalNotes, resolutionNotes, comment bodies) sang kiểu `@db.NVarChar(Max)`.
- Điều chỉnh các ràng buộc quan hệ ngoại khóa (foreign keys) để tương thích hoàn toàn với engine SQL Server, tránh lỗi chu trình hoặc nhiều đường cascade (Multiple Cascade Paths - Error 1785).

## Chi tiết kỹ thuật
- `RoleDefinition.permissions`: `@db.NVarChar(Max)`
- `CustomerTicket.description`, `internalNotes`, `resolutionNotes`: `@db.NVarChar(Max)`
- `Task.description`: `@db.NVarChar(Max)`
- `Comment.body`: `@db.NVarChar(Max)`
- `TicketComment.message`: `@db.NVarChar(Max)`
- `Notification.message`: `@db.NVarChar(Max)`
- Foreign keys: Điều chỉnh `onDelete: NoAction` ở các nhánh phụ nếu cần thiết để SQL Server chấp nhận quan hệ cascade của Project/Task.
