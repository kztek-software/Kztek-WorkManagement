const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('--- KHỞI CHẠY MIGRATION BẢNG ATTACHMENT ---');

// 1. Tạo bảng Attachment nếu chưa tồn tại
db.exec(`
  CREATE TABLE IF NOT EXISTS Attachment (
    id TEXT PRIMARY KEY,
    taskId TEXT,
    ticketId TEXT,
    uploaderId TEXT,
    fileName TEXT NOT NULL,
    fileUrl TEXT NOT NULL,
    fileType TEXT NOT NULL, -- image | video | document | other
    fileSize INTEGER,
    mimeType TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE,
    FOREIGN KEY (ticketId) REFERENCES CustomerTicket(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaderId) REFERENCES User(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_attachment_taskId ON Attachment(taskId);
  CREATE INDEX IF NOT EXISTS idx_attachment_ticketId ON Attachment(ticketId);
  CREATE INDEX IF NOT EXISTS idx_attachment_uploaderId ON Attachment(uploaderId);
`);

console.log('✓ Bảng Attachment và các Index đã được tạo thành công!');
db.close();
