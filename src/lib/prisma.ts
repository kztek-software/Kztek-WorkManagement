import path from "path";
import fs from "fs";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getDatabaseUrl(): string {
  // Ưu tiên biến môi trường DATABASE_URL nếu có
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Tự động tìm đường dẫn tuyệt đối đến file dev.db bất kể chạy trên Windows, Linux hay macOS
  const cwd = process.cwd();
  const dbDir = path.join(cwd, "prisma");
  
  // Đảm bảo thư mục prisma tồn tại
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      // ignore
    }
  }

  const dbPath = path.join(dbDir, "dev.db");
  
  // Chuẩn hóa đường dẫn file cho SQLite trên mọi hệ điều hành
  const normalizedPath = dbPath.replace(/\\/g, "/");
  return `file:${normalizedPath}`;
}

function createClient() {
  const url = getDatabaseUrl();
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
