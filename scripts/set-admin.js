const Database = require('better-sqlite3');
const db = new Database('./prisma/dev.db');

// Set role ADMIN for anhnv and admin users
db.prepare("UPDATE User SET role = 'ADMIN' WHERE email LIKE '%anhnv%' OR email LIKE '%admin%' OR name LIKE '%anhnv%'").run();

const users = db.prepare("SELECT id, name, email, role FROM User").all();
console.log('All Users after update:', users);
