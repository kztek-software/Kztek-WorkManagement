import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  // 1. Tìm project mà user là thành viên
  let targetProject = await prisma.project.findFirst({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  // 2. Nếu user chưa được gán vào project nào nhưng hệ thống đã có sẵn project:
  // Tự động gán user vào project mặc định (role OWNER nếu là Admin, MEMBER nếu là thành viên)
  if (!targetProject) {
    const anyProject = await prisma.project.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (anyProject) {
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: { projectId: anyProject.id, userId: user.id },
        },
        update: { role: user.role === "ADMIN" ? "OWNER" : "MEMBER" },
        create: {
          projectId: anyProject.id,
          userId: user.id,
          role: user.role === "ADMIN" ? "OWNER" : "MEMBER",
        },
      });
      targetProject = { id: anyProject.id };
    }
  }

  // 3. Chỉ khi toàn bộ hệ thống chưa có project nào mới chuyển sang /welcome
  if (!targetProject) {
    redirect("/welcome");
  }

  redirect(`/projects/${targetProject.id}/board`);
}
