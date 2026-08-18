const { PrismaClient } = require('./src/generated/prisma/client.js');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' });
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const tickets = await prisma.$queryRawUnsafe('SELECT * FROM CustomerTicket');
    console.log('CustomerTicket query raw works! Count:', tickets.length);
  } catch (err) {
    console.error('Error querying tickets:', err);
  }
}

test();
