import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { PermissionsProvider } from "@/lib/permissions-context";
import { getUserPermissionContext } from "@/lib/permissions-server";

export const dynamic = "force-dynamic";

export default async function ProjectLayout({
  children,
  params,
}: LayoutProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [project, projects, permCtx] = await Promise.all([
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
    // Truyền user.role đã có sẵn để tránh query DB lần 2
    getUserPermissionContext(user.id, projectId, user.role),
  ]);

  if (!project) redirect("/");

  return (
    <PermissionsProvider
      projectId={project.id}
      initialPermissions={permCtx.permissions}
      initialRole={permCtx.role}
      initialProjectRole={permCtx.projectRole}
      initialIsAdmin={permCtx.isAdmin}
      initialIsOwner={permCtx.isOwner}
      initialCanCreateProject={permCtx.canCreateProject}
    >
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
    </PermissionsProvider>
  );
}
