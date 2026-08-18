const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');

// Kiểm tra dates trong Project table
const projects = db.prepare('SELECT id, createdAt, updatedAt FROM Project').all();
console.log('Projects raw in DB:', projects);

// Chuẩn hóa format updatedAt sang ISO 8601 nếu chưa chuẩn
const nowIso = new Date().toISOString();
db.prepare("UPDATE Project SET updatedAt = ? WHERE updatedAt IS NULL OR updatedAt NOT LIKE '%T%'").run(nowIso);

const updatedProjects = db.prepare('SELECT id, createdAt, updatedAt FROM Project').all();
console.log('Projects after fix in DB:', updatedProjects);
