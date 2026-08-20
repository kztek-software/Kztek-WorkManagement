import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/bus";
import { checkUserPermission } from "@/lib/permissions-server";

const updateSchema = z.object({
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]).optional(),
  name: z.string().min(2).max(100).optional(),
  goal: z.string().max(300).nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  const user = await requireUser();
  const { projectId, sprintId } = await params;

  const permCheck = await checkUserPermission(user.id, "sprints.manage", projectId, user.role);
  if (!permCheck.allowed) {
    return NextResponse.json({ error: permCheck.reason || "Không có quyền quản trị Sprint này" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }
  const d = parsed.data;

  // Khi kích hoạt sprint, tự động deactivate sprint ACTIVE khác
  if (d.status === "ACTIVE") {
    await prisma.sprint.updateMany({
      where: { projectId, status: "ACTIVE", NOT: { id: sprintId } },
      data: { status: "COMPLETED", endDate: new Date() },
    });
  }

  const sprint = await prisma.sprint.update({
    where: { id: sprintId },
    data: {
      status: d.status,
      name: d.name,
      goal: d.goal,
      startDate: d.startDate === undefined ? undefined : d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate === undefined ? undefined : d.endDate ? new Date(d.endDate) : null,
    },
  });

  publish(projectId, { type: "SPRINT_CHANGED", actorId: user.id });
  return NextResponse.json({ sprint });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; sprintId: string }> }
) {
  const user = await requireUser();
  const { projectId, sprintId } = await params;

  const permCheck = await checkUserPermission(user.id, "sprints.manage", projectId, user.role);
  if (!permCheck.allowed) {
    return NextResponse.json({ error: permCheck.reason || "Không có quyền xóa Sprint này" }, { status: 403 });
  }

  // Gỡ liên kết sprint khỏi các task liên quan (chuyển về Backlog)
  await prisma.task.updateMany({
    where: { projectId, sprintId },
    data: { sprintId: null },
  });

  await prisma.sprint.delete({
    where: { id: sprintId },
  });

  publish(projectId, { type: "SPRINT_CHANGED", actorId: user.id });
  publish(projectId, { type: "TASK_CHANGED", actorId: user.id });

  return NextResponse.json({ ok: true });
}
