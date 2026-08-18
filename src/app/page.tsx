import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const firstProject = await prisma.project.findFirst({
    where: { members: { some: { userId: user.id } } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (!firstProject) redirect("/welcome");
  redirect(`/projects/${firstProject.id}/board`);
}
