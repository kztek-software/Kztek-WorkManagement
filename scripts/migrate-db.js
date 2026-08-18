const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
const db = new Database(dbPath);

const cols = db.pragma('table_info(Project)').map((c) => c.name);
console.log('Current Project columns:', cols);

if (!cols.includes('status')) {
  db.exec("ALTER TABLE Project ADD COLUMN status TEXT NOT NULL DEFAULT 'PLANNING'");
  console.log("✓ Added 'status' column to Project table");
} else {
  console.log("• 'status' column already exists");
}

if (!cols.includes('updatedAt')) {
  db.exec("ALTER TABLE Project ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT '2026-01-01 00:00:00'");
  console.log("✓ Added 'updatedAt' column to Project table");
} else {
  console.log("• 'updatedAt' column already exists");
}

const updatedCols = db.pragma('table_info(Project)').map((c) => c.name);
console.log('Updated Project columns:', updatedCols);
console.log('Database migration completed successfully!');
db.close();
