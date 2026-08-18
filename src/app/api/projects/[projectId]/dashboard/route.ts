import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { STATUSES, PRIORITIES, TASK_TYPES } from "@/lib/constants";
import type { ProjectDashboardData } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const currentMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });

  if (!currentMember && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Không có quyền truy cập dự án này" }, { status: 403 });
  }

  const [project, tasks, sprints, tickets, activities] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatarColor: true, title: true } },
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
                team: { select: { id: true, name: true, code: true, color: true } },
              },
            },
          },
          orderBy: { role: "asc" },
        },
      },
    }),
    prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarColor: true, title: true } },
        customerTicket: { select: { id: true, trackingCode: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sprint.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.customerTicket.findMany({
      where: { projectId },
      select: { id: true, status: true, priority: true, type: true, createdAt: true, resolvedAt: true },
    }),
    prisma.activity.findMany({
      where: { task: { projectId } },
      include: {
        actor: { select: { id: true, name: true, avatarColor: true } },
        task: { select: { id: true, number: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  if (!project) {
    return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 1. Task Summary Calculation
  const totalTasks = tasks.length;
  let doneTasks = 0;
  let inProgressTasks = 0;
  let inReviewTasks = 0;
  let todoTasks = 0;
  let backlogTasks = 0;
  let overdueTasks = 0;
  let urgentTasks = 0;
  let totalStoryPoints = 0;
  let doneStoryPoints = 0;

  const statusCountMap: Record<string, number> = {};
  const priorityCountMap: Record<string, number> = {};
  const typeCountMap: Record<string, number> = {};

  for (const s of STATUSES) statusCountMap[s.id] = 0;
  for (const p of PRIORITIES) priorityCountMap[p.id] = 0;
  for (const t of TASK_TYPES) typeCountMap[t.id] = 0;

  const urgentAndOverdueList: ProjectDashboardData["urgentAndOverdueTasks"] = [];

  for (const t of tasks) {
    const pts = t.storyPoints || 0;
    totalStoryPoints += pts;

    statusCountMap[t.status] = (statusCountMap[t.status] || 0) + 1;
    priorityCountMap[t.priority] = (priorityCountMap[t.priority] || 0) + 1;
    typeCountMap[t.type] = (typeCountMap[t.type] || 0) + 1;

    let isTaskOverdue = false;
    if (t.dueDate && t.status !== "DONE") {
      const due = new Date(t.dueDate);
      if (due < startOfToday) {
        overdueTasks++;
        isTaskOverdue = true;
      }
    }

    if (t.status === "DONE") {
      doneTasks++;
      doneStoryPoints += pts;
    } else if (t.status === "IN_PROGRESS") {
      inProgressTasks++;
    } else if (t.status === "IN_REVIEW") {
      inReviewTasks++;
    } else if (t.status === "TODO") {
      todoTasks++;
    } else if (t.status === "BACKLOG") {
      backlogTasks++;
    }

    if (t.priority === "URGENT" && t.status !== "DONE") {
      urgentTasks++;
    }

    if ((isTaskOverdue || t.priority === "URGENT") && t.status !== "DONE") {
      urgentAndOverdueList.push({
        id: t.id,
        number: t.number,
        title: t.title,
        status: t.status,
        priority: t.priority,
        type: t.type,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        isOverdue: isTaskOverdue,
        assignee: t.assignee,
        storyPoints: t.storyPoints,
      });
    }
  }

  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const remainingStoryPoints = Math.max(0, totalStoryPoints - doneStoryPoints);
  const pointsCompletionRate = totalStoryPoints > 0 ? Math.round((doneStoryPoints / totalStoryPoints) * 100) : 0;

  // 2. Active Sprint Calculation
  const rawActiveSprint = sprints.find((s) => s.status === "ACTIVE") || null;
  let activeSprintDto: ProjectDashboardData["activeSprint"] = null;

  if (rawActiveSprint) {
    const sprintTasks = tasks.filter((t) => t.sprintId === rawActiveSprint.id);
    const sprintDone = sprintTasks.filter((t) => t.status === "DONE");
    const sprintTotalPts = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const sprintDonePts = sprintDone.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    let daysRemaining: number | null = null;
    if (rawActiveSprint.endDate) {
      const end = new Date(rawActiveSprint.endDate).getTime();
      const diffDays = Math.ceil((end - now.getTime()) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, diffDays);
    }

    activeSprintDto = {
      id: rawActiveSprint.id,
      name: rawActiveSprint.name,
      goal: rawActiveSprint.goal,
      status: rawActiveSprint.status,
      startDate: rawActiveSprint.startDate ? rawActiveSprint.startDate.toISOString() : null,
      endDate: rawActiveSprint.endDate ? rawActiveSprint.endDate.toISOString() : null,
      daysRemaining,
      totalTasks: sprintTasks.length,
      doneTasks: sprintDone.length,
      totalPoints: sprintTotalPts,
      donePoints: sprintDonePts,
    };
  }

  // 3. Status, Priority, Type Distributions
  const statusDistribution = STATUSES.map((s) => ({
    status: s.id,
    label: s.label,
    count: statusCountMap[s.id] || 0,
    color: s.color,
  }));

  const priorityDistribution = PRIORITIES.map((p) => ({
    priority: p.id,
    label: p.label,
    count: priorityCountMap[p.id] || 0,
    color: p.color,
  }));

  const typeDistribution = TASK_TYPES.map((t) => ({
    type: t.id,
    label: t.label,
    count: typeCountMap[t.id] || 0,
    color: t.color,
  }));

  // 4. Member Workloads Calculation
  const memberWorkloads = project.members.map((m) => {
    const assigned = tasks.filter((t) => t.assigneeId === m.user.id);
    const done = assigned.filter((t) => t.status === "DONE");
    const inProg = assigned.filter((t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW");
    const overdue = assigned.filter((t) => {
      if (!t.dueDate || t.status === "DONE") return false;
      return new Date(t.dueDate) < startOfToday;
    });
    const pts = assigned.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const rate = assigned.length > 0 ? Math.round((done.length / assigned.length) * 100) : 0;

    return {
      userId: m.user.id,
      name: m.user.name,
      avatarColor: m.user.avatarColor,
      title: m.user.title,
      role: m.role,
      teamName: m.user.team?.name || null,
      teamColor: m.user.team?.color || null,
      totalTasks: assigned.length,
      doneTasks: done.length,
      inProgressTasks: inProg.length,
      overdueTasks: overdue.length,
      storyPoints: pts,
      completionRate: rate,
    };
  });

  // 5. Team Breakdown Calculation
  const teamMap = new Map<string, { id: string; name: string; code: string; color: string; memberCount: number; totalTasks: number; doneTasks: number }>();
  for (const m of project.members) {
    if (m.user.team) {
      const t = m.user.team;
      if (!teamMap.has(t.id)) {
        teamMap.set(t.id, {
          id: t.id,
          name: t.name,
          code: t.code,
          color: t.color,
          memberCount: 0,
          totalTasks: 0,
          doneTasks: 0,
        });
      }
      const entry = teamMap.get(t.id)!;
      entry.memberCount++;
      const userTasks = tasks.filter((task) => task.assigneeId === m.user.id);
      entry.totalTasks += userTasks.length;
      entry.doneTasks += userTasks.filter((task) => task.status === "DONE").length;
    }
  }
  const teamBreakdown = Array.from(teamMap.values());

  // 6. Ticket Statistics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((tk) => tk.status === "OPEN").length;
  const triagedTickets = tickets.filter((tk) => tk.status === "TRIAGED").length;
  const inProgressTickets = tickets.filter((tk) => tk.status === "IN_PROGRESS").length;
  const resolvedTickets = tickets.filter((tk) => tk.status === "RESOLVED").length;
  const closedTickets = tickets.filter((tk) => tk.status === "CLOSED").length;
  const ticketResolutionRate = totalTickets > 0 ? Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100) : 0;

  const dashboardData: ProjectDashboardData = {
    project: {
      id: project.id,
      name: project.name,
      key: project.key,
      description: project.description,
      status: project.status,
      ownerId: project.ownerId,
      owner: project.owner,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      members: project.members.map((m) => ({
        id: m.id,
        role: m.role,
        user: m.user,
      })),
    },
    currentRole: currentMember?.role || (user.role === "ADMIN" ? "ADMIN" : "VIEWER"),
    summary: {
      totalTasks,
      doneTasks,
      inProgressTasks,
      inReviewTasks,
      todoTasks,
      backlogTasks,
      overdueTasks,
      urgentTasks,
      completionRate,
      totalStoryPoints,
      doneStoryPoints,
      remainingStoryPoints,
      pointsCompletionRate,
    },
    activeSprint: activeSprintDto,
    statusDistribution,
    priorityDistribution,
    typeDistribution,
    memberWorkloads,
    teamBreakdown,
    urgentAndOverdueTasks: urgentAndOverdueList.slice(0, 8),
    recentActivities: activities.map((a) => ({
      id: a.id,
      action: a.action,
      detail: a.detail,
      createdAt: a.createdAt.toISOString(),
      actor: a.actor,
      task: a.task,
    })),
    ticketStats: {
      total: totalTickets,
      open: openTickets,
      triaged: triagedTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      resolutionRate: ticketResolutionRate,
    },
  };

  return NextResponse.json(dashboardData);
}
