import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

  const [sprints, tasks, members] = await Promise.all([
    prisma.sprint.findMany({ where: { projectId }, orderBy: { createdAt: "asc" } }),
    prisma.task.findMany({
      where: { projectId },
      select: {
        id: true,
        storyPoints: true,
        status: true,
        priority: true,
        assigneeId: true,
        sprintId: true,
        createdAt: true,
        completedAt: true,
      },
    }),
    prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, avatarColor: true, title: true } } },
    }),
  ]);

  // ---- Burndown của sprint ACTIVE (hoặc sprint gần nhất có ngày) ----
  const activeSprint =
    sprints.find((s) => s.status === "ACTIVE") ??
    [...sprints].reverse().find((s) => s.startDate && s.endDate);

  let burndown: { date: string; ideal: number; actual: number | null }[] = [];
  let burndownSprint = null as null | { id: string; name: string; totalPoints: number };

  if (activeSprint?.startDate && activeSprint?.endDate) {
    const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint.id);
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const start = new Date(activeSprint.startDate);
    const end = new Date(activeSprint.endDate);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));

    const completedByDay = new Map<string, number>();
    for (const t of sprintTasks) {
      if (t.completedAt) {
        const k = dayKey(t.completedAt);
        completedByDay.set(k, (completedByDay.get(k) ?? 0) + (t.storyPoints ?? 0));
      }
    }

    const today = new Date();
    let remaining = totalPoints;
    const pointsDoneBeforeStart = 0;
    remaining -= pointsDoneBeforeStart;

    const series: { date: string; ideal: number; actual: number | null }[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const k = dayKey(d);
      const ideal = Math.max(0, totalPoints - (totalPoints / totalDays) * i);
      let actual: number | null = null;
      if (d <= today) {
        remaining -= completedByDay.get(k) ?? 0;
        actual = Math.max(0, remaining);
      }
      series.push({ date: k, ideal: Math.round(ideal * 10) / 10, actual });
    }
    burndown = series;
    burndownSprint = { id: activeSprint.id, name: activeSprint.name, totalPoints };
  }

  // ---- Velocity qua các sprint ----
  const velocity = sprints
    .filter((s) => s.startDate)
    .map((s) => {
      const sprintTasks = tasks.filter((t) => t.sprintId === s.id);
      const committed = sprintTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
      const completed = sprintTasks
        .filter((t) => t.status === "DONE")
        .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
      return { name: s.name, committed, completed, status: s.status };
    });

  // ---- Workload theo thành viên (tasks đang mở) ----
  const openStatuses = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW"];
  const workload = members.map((m) => {
    const mine = tasks.filter((t) => t.assigneeId === m.user.id && openStatuses.includes(t.status));
    return {
      userId: m.user.id,
      name: m.user.name,
      avatarColor: m.user.avatarColor,
      title: m.user.title,
      taskCount: mine.length,
      points: mine.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0),
      urgent: mine.filter((t) => t.priority === "URGENT").length,
    };
  });

  // ---- Phân bố priority (tasks đang mở) ----
  const priorityDist = ["URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => ({
    priority: p,
    count: tasks.filter((t) => t.priority === p && openStatuses.includes(t.status)).length,
  }));

  // ---- Tổng quan ----
  const summary = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "DONE").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    openPoints: tasks
      .filter((t) => openStatuses.includes(t.status))
      .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0),
  };

  return NextResponse.json({ burndown, burndownSprint, velocity, workload, priorityDist, summary });
}
