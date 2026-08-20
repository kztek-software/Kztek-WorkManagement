import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "sqlserver://14.160.26.45:9999;database=WorkingManager;user=vietanh;password=Kztek123456;encrypt=true;trustServerCertificate=true;",
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
