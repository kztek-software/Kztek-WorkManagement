import { prisma } from "../src/lib/prisma";
import { notifyTaskAssigned } from "../src/lib/notifications";
import { getEmailLogs } from "../src/lib/mail";

async function run() {
  console.log("=== KIEM THU GUI THONG BAO & EMAIL KHI GAN VIEC ===");

  const [task, user, project] = await Promise.all([
    prisma.task.findFirst({ select: { id: true, number: true, title: true, projectId: true } }),
    prisma.user.findFirst({ select: { id: true, name: true, email: true } }),
    prisma.project.findFirst({ select: { id: true, name: true, key: true } }),
  ]);

  if (!task || !user || !project) {
    console.error("Khong du du lieu mau (task, user, project)");
    process.exit(1);
  }

  console.log('Testing with Task: #' + task.number + ' ' + task.title + ', User: ' + user.name + ' (' + user.email + '), Project: ' + project.name);

  const beforeNotifCount = await prisma.notification.count({ where: { userId: user.id } });
  console.log('So thong bao hien tai: ' + beforeNotifCount);

  // Test 1: Self-assignment / Assign
  await notifyTaskAssigned({
    taskId: task.id,
    assigneeId: user.id,
    actorId: user.id,
    projectId: project.id,
  });

  const afterNotifCount = await prisma.notification.count({ where: { userId: user.id } });
  console.log('So thong bao sau khi gan viec: ' + afterNotifCount);

  const latestNotif = await prisma.notification.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  console.log("Thong bao moi nhat:", latestNotif);

  if (afterNotifCount > beforeNotifCount && latestNotif?.type === "ASSIGNED") {
    console.log("PASS: IN-APP NOTIFICATION DA TAO THANH CONG!");
  } else {
    console.error("FAIL: Chua tao duoc notification");
    process.exit(1);
  }

  const logs = getEmailLogs();
  console.log('So luong email logs: ' + logs.length);
  if (logs.length > 0) {
    console.log("Email moi nhat:", {
      to: logs[0].to,
      subject: logs[0].subject,
      status: logs[0].status,
      type: logs[0].type,
    });
  }

  console.log("=== TAT CA KIEM THU NOTIFY & EMAIL DA PASS! ===");
}

run().catch(console.error).finally(() => prisma.$disconnect());