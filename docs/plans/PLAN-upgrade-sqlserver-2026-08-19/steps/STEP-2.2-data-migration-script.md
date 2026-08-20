# STEP 2.2: Di chuyển Dữ liệu từ SQLite sang SQL Server (Data Migration)

## Mục tiêu
- Xây dựng script `scripts/migrate-sqlite-to-sqlserver.ts`.
- Đọc tuần tự dữ liệu hiện có trong `prisma/dev.db` (Users, Teams, RoleDefinitions, Projects, ProjectMembers, Sprints, Tasks, Labels, TaskLabels, Subtasks, Comments, Activities, CustomerTickets, TicketComments, Attachments, Notifications).
- Ghi chính xác vào SQL Server, bảo toàn toàn bộ Primary Keys (ID), Foreign Keys và Timestamps.
- Kiểm tra tính toàn vẹn dữ liệu (Data Integrity) và số lượng bản ghi sau khi di chuyển.
