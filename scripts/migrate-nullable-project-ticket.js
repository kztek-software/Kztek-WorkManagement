const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
const db = new Database(dbPath);

console.log('--- KIỂM TRA & MIGRATION SCHEMA CHO CUSTOMER TICKET NULLABLE PROJECT ---');

// Check CustomerTicket table info in SQLite
const tableInfo = db.prepare('PRAGMA table_info(CustomerTicket)').all();
console.log('Cấu trúc cột CustomerTicket hiện tại:');
tableInfo.forEach((col) => {
  console.log(` - ${col.name}: ${col.type} (notnull: ${col.notnull}, dflt: ${col.dflt_value})`);
});

// If projectId is NOT NULL (notnull === 1), create a new table and copy data
const projectIdCol = tableInfo.find((c) => c.name === 'projectId');
if (projectIdCol && projectIdCol.notnull === 1) {
  console.log('Đang chuyển đổi cột projectId sang NULLABLE...');
  db.exec(`
    CREATE TABLE CustomerTicket_new (
      id TEXT PRIMARY KEY,
      trackingCode TEXT UNIQUE NOT NULL,
      projectId TEXT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'BUG',
      status TEXT NOT NULL DEFAULT 'OPEN',
      priority TEXT NOT NULL DEFAULT 'MEDIUM',
      customerName TEXT NOT NULL,
      customerEmail TEXT NOT NULL,
      customerPhone TEXT,
      customerCompany TEXT,
      environment TEXT,
      convertedTaskId TEXT UNIQUE,
      internalNotes TEXT,
      resolutionNotes TEXT,
      resolvedAt DATETIME,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE SET NULL,
      FOREIGN KEY (convertedTaskId) REFERENCES Task(id) ON DELETE SET NULL
    );

    INSERT INTO CustomerTicket_new SELECT * FROM CustomerTicket;

    DROP TABLE CustomerTicket;

    ALTER TABLE CustomerTicket_new RENAME TO CustomerTicket;

    CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_ticket_tracking ON CustomerTicket(trackingCode);
    CREATE INDEX IF NOT EXISTS idx_customer_ticket_project ON CustomerTicket(projectId);
    CREATE INDEX IF NOT EXISTS idx_customer_ticket_status ON CustomerTicket(status);
  `);
  console.log('✓ Đã chuyển đổi thành công sang CustomerTicket (projectId nullable)!');
} else {
  console.log('✓ Cột projectId đã là NULLABLE trong SQLite!');
}

db.close();
