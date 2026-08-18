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
        number: true,
        title: true,
        storyPoints: true,
        status: true,
        priority: true,
        assigneeId: true,
        sprintId: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        completedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, avatarColor: true, title: true } } },
      orderBy: { role: "asc" },
    }),
  ]);

  const now = new Date();
  const openStatuses = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW"];

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

    let remaining = totalPoints;
    const series: { date: string; ideal: number; actual: number | null }[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const k = dayKey(d);
      const ideal = Math.max(0, totalPoints - (totalPoints / totalDays) * i);
      let actual: number | null = null;
      if (d <= now) {
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

  // ---- BÁO CÁO CHI TIẾT THEO TỪNG TÀI KHOẢN (ACCOUNT-LEVEL ANALYTICS) ----
  const accountReports = members.map((m) => {
    const myTasks = tasks.filter((t) => t.assigneeId === m.user.id);
    const doneTasks = myTasks.filter((t) => t.status === "DONE");
    const inProgressTasks = myTasks.filter((t) => t.status === "IN_PROGRESS");
    const inReviewTasks = myTasks.filter((t) => t.status === "IN_REVIEW");
    const todoTasks = myTasks.filter((t) => t.status === "TODO");
    const backlogTasks = myTasks.filter((t) => t.status === "BACKLOG");

    const overdueTasks = myTasks.filter((t) => {
      if (t.status === "DONE" || !t.dueDate) return false;
      return new Date(t.dueDate).getTime() < now.getTime();
    });

    const totalPoints = myTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const donePoints = doneTasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
    const remainingPoints = totalPoints - donePoints;

    const completionRate = myTasks.length > 0 ? Math.round((doneTasks.length / myTasks.length) * 100) : 0;
    const pointsRate = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

    const priorityBreakdown = {
      URGENT: myTasks.filter((t) => t.priority === "URGENT").length,
      HIGH: myTasks.filter((t) => t.priority === "HIGH").length,
      MEDIUM: myTasks.filter((t) => t.priority === "MEDIUM").length,
      LOW: myTasks.filter((t) => t.priority === "LOW").length,
    };

    const statusBreakdown = {
      BACKLOG: backlogTasks.length,
      TODO: todoTasks.length,
      IN_PROGRESS: inProgressTasks.length,
      IN_REVIEW: inReviewTasks.length,
      DONE: doneTasks.length,
    };

    return {
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatarColor: m.user.avatarColor,
      title: m.user.title,
      role: m.role,
      summary: {
        totalAssigned: myTasks.length,
        done: doneTasks.length,
        inProgress: inProgressTasks.length,
        inReview: inReviewTasks.length,
        todo: todoTasks.length,
        backlog: backlogTasks.length,
        overdueCount: overdueTasks.length,
        totalPoints,
        donePoints,
        remainingPoints,
        completionRate,
        pointsRate,
      },
      priorityBreakdown,
      statusBreakdown,
      overdueTasks: overdueTasks.map((t) => ({
        id: t.id,
        number: t.number,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        storyPoints: t.storyPoints,
      })),
      recentTasks: myTasks.slice(0, 6).map((t) => ({
        id: t.id,
        number: t.number,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        storyPoints: t.storyPoints,
        updatedAt: t.updatedAt,
      })),
    };
  });

  // ---- Tổng quan toàn dự án ----
  const allOverdue = tasks.filter((t) => {
    if (t.status === "DONE" || !t.dueDate) return false;
    return new Date(t.dueDate).getTime() < now.getTime();
  });

  const summary = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "DONE").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    inReview: tasks.filter((t) => t.status === "IN_REVIEW").length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    backlog: tasks.filter((t) => t.status === "BACKLOG").length,
    overdue: allOverdue.length,
    totalPoints: tasks.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0),
    donePoints: tasks
      .filter((t) => t.status === "DONE")
      .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0),
    openPoints: tasks
      .filter((t) => openStatuses.includes(t.status))
      .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0),
  };

  return NextResponse.json({
    burndown,
    burndownSprint,
    velocity,
    workload,
    priorityDist,
    accountReports,
    summary,
    currentRole: member.role,
  });
}
