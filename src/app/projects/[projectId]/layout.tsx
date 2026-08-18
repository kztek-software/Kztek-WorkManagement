import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function ProjectLayout({
  children,
  params,
}: LayoutProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [project, projects] = await Promise.all([
    prisma.project.findFirst({
      where: user.role === "ADMIN"
        ? { id: projectId }
        : { id: projectId, members: { some: { userId: user.id } } },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarColor: true,
                title: true,
                team: { select: { id: true, name: true, code: true, color: true } },
              },
            },
          },
        },
      },
    }),
    prisma.project.findMany({
      where: { members: { some: { userId: user.id } } },
      select: { id: true, name: true, key: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (!project) redirect("/");

  return (
    <AppShell
      user={user}
      project={{
        id: project.id,
        name: project.name,
        key: project.key,
        members: project.members.map((m) => ({
          id: m.id,
          role: m.role,
          user: m.user,
        })),
      }}
      projects={projects}
    >
      {children}
    </AppShell>
  );
}
