import { prisma } from "../src/lib/prisma";
async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log("=== DANH SACH USERS TRONG CSDL ===");
  console.log(users);
}
main().finally(() => prisma.$disconnect());