const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../prisma/dev.db');
console.log('Connecting to SQLite DB at:', dbPath);

const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS "CustomerTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingCode" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BUG',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerCompany" TEXT,
    "environment" TEXT,
    "convertedTaskId" TEXT,
    "internalNotes" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerTicket_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CustomerTicket_convertedTaskId_fkey" FOREIGN KEY ("convertedTaskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CustomerTicket_trackingCode_key" ON "CustomerTicket"("trackingCode");
CREATE UNIQUE INDEX IF NOT EXISTS "CustomerTicket_convertedTaskId_key" ON "CustomerTicket"("convertedTaskId");

CREATE TABLE IF NOT EXISTS "TicketComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "isStaff" INTEGER NOT NULL DEFAULT 0,
    "isInternalOnly" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TicketComment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "CustomerTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
`);

console.log('Tables CustomerTicket and TicketComment created successfully in SQLite!');
db.close();
