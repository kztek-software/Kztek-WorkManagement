import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(_req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  // BẢO VỆ PHÂN QUYỀN: Chỉ tài khoản có vai trò ADMIN mới được truy cập
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Từ chối truy cập: Bạn không có quyền quản trị toàn bộ dự án" },
      { status: 403 }
    );
  }

  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarColor: true,
            title: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarColor: true,
                title: true,
                role: true,
                teamId: true,
                team: { select: { id: true, name: true, code: true, color: true } },
              },
            },
          },
          orderBy: { role: "asc" },
        },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            storyPoints: true,
            dueDate: true,
          },
        },
        customerTickets: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
            customerTickets: true,
            sprints: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const enrichedProjects = projects.map((p) => {
      const totalTasks = p.tasks.length;
      const doneTasks = p.tasks.filter((t) => t.status === "DONE").length;
      const inProgressTasks = p.tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW").length;
      const overdueTasks = p.tasks.filter((t) => {
        if (!t.dueDate || t.status === "DONE") return false;
        const d = new Date(t.dueDate);
        return !isNaN(d.getTime()) && d < startOfToday;
      }).length;

      const totalPoints = p.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

      // Danh sách các phòng ban tham gia (unique teams)
      const teamMap = new Map<string, { id: string; name: string; code: string; color: string }>();
      for (const m of p.members) {
        if (m.user.team) {
          teamMap.set(m.user.team.id, m.user.team);
        }
      }
      const teams = Array.from(teamMap.values());

      return {
        id: p.id,
        name: p.name,
        key: p.key,
        description: p.description,
        status: p.status || "PLANNING",
        ownerId: p.ownerId,
        owner: p.owner,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        memberCount: p.members.length,
        members: p.members.map((m) => ({
          id: m.id,
          role: m.role,
          user: m.user,
        })),
        teams,
        metrics: {
          totalTasks,
          doneTasks,
          inProgressTasks,
          overdueTasks,
          totalPoints,
          completionRate,
          ticketCount: p.customerTickets.length,
          sprintCount: p._count.sprints,
        },
      };
    });

    return NextResponse.json({
      projects: enrichedProjects,
      totalCount: enrichedProjects.length,
    });
  } catch (error) {
    console.error("Error in GET /api/admin/projects:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải danh sách tất cả dự án", details: String(error) },
      { status: 500 }
    );
  }
}
