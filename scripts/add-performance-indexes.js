const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

console.log('--- Đang khởi tạo các chỉ mục Performance Indexes cho SQLite Database ---');

const indexes = [
  'CREATE INDEX IF NOT EXISTS "Task_projectId_status_idx" ON "Task"("projectId", "status");',
  'CREATE INDEX IF NOT EXISTS "Task_projectId_sprintId_idx" ON "Task"("projectId", "sprintId");',
  'CREATE INDEX IF NOT EXISTS "Task_assigneeId_idx" ON "Task"("assigneeId");',
  'CREATE INDEX IF NOT EXISTS "Task_createdAt_idx" ON "Task"("createdAt");',
  'CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");',
  'CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");',
  'CREATE INDEX IF NOT EXISTS "CustomerTicket_status_idx" ON "CustomerTicket"("status");',
  'CREATE INDEX IF NOT EXISTS "CustomerTicket_projectId_idx" ON "CustomerTicket"("projectId");',
  'CREATE INDEX IF NOT EXISTS "CustomerTicket_createdAt_idx" ON "CustomerTicket"("createdAt");',
  'CREATE INDEX IF NOT EXISTS "Comment_taskId_idx" ON "Comment"("taskId");',
  'CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt");',
  'CREATE INDEX IF NOT EXISTS "Activity_taskId_idx" ON "Activity"("taskId");',
  'CREATE INDEX IF NOT EXISTS "Activity_createdAt_idx" ON "Activity"("createdAt");',
  'CREATE INDEX IF NOT EXISTS "Attachment_taskId_idx" ON "Attachment"("taskId");',
  'CREATE INDEX IF NOT EXISTS "Attachment_ticketId_idx" ON "Attachment"("ticketId");',
  'CREATE INDEX IF NOT EXISTS "TicketComment_ticketId_idx" ON "TicketComment"("ticketId");',
  'CREATE INDEX IF NOT EXISTS "TicketComment_createdAt_idx" ON "TicketComment"("createdAt");',
];

for (const sql of indexes) {
  try {
    db.exec(sql);
  } catch (err) {
    console.warn(`Lỗi khi tạo index: ${sql}`, err.message);
  }
}

const createdIndexes = db.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%';").all();
console.log(`\n✓ Đã xác nhận ${createdIndexes.length} performance indexes trong SQLite dev.db:`);
for (const row of createdIndexes) {
  console.log(`  • Bảng [${row.tbl_name}] -> Index [${row.name}]`);
}

db.close();
console.log('\n--- Hoàn tất tối ưu hóa Database Indexes! ---');
