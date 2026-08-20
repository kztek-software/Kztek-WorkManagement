import { notifyTaskAssigned } from "../src/lib/notifications";
import { prisma } from "../src/lib/prisma";

async function main() {
  const vietAnh = await prisma.user.findFirst({ where: { email: "anhnv09031997@gmail.com" } });
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const task = await prisma.task.findFirst();
  const project = await prisma.project.findFirst();

  if (vietAnh && admin && task && project) {
    console.log("=== GUI EMAIL THU NGHIEM DEN anhnv09031997@gmail.com ===");
    await notifyTaskAssigned({
      taskId: task.id,
      assigneeId: vietAnh.id,
      actorId: admin.id,
      projectId: project.id,
    });
    console.log("DA GOI notifyTaskAssigned cho Nguyen Viet Anh");
  }
}
main().finally(() => prisma.$disconnect());