import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Attachment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "taskId" TEXT,
      "ticketId" TEXT,
      "uploaderId" TEXT,
      "fileName" TEXT NOT NULL,
      "fileUrl" TEXT NOT NULL,
      "fileType" TEXT NOT NULL,
      "fileSize" INTEGER,
      "mimeType" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Attachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Attachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "CustomerTicket" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Attachment_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);
  console.log("Attachment table created/verified successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
