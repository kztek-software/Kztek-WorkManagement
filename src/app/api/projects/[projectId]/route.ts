import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageMembers } from "@/lib/permissions";

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

  const project = await prisma.project.findUnique({
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
              team: { select: { id: true, name: true, code: true, color: true } },
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
          members: true,
          sprints: true,
          customerTickets: true,
        },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
  }

  return NextResponse.json({
    project,
    currentRole: currentMember?.role || (user.role === "ADMIN" ? "ADMIN" : "VIEWER"),
  });
}

const updateProjectSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const currentMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });

  const isAllowed = user.role === "ADMIN" || (currentMember && canManageMembers(currentMember.role));
  if (!isAllowed) {
    return NextResponse.json({ error: "Chỉ Quản trị viên hoặc Chủ dự án mới có quyền cập nhật" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu cập nhật không hợp lệ" },
      { status: 400 }
    );
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description?.trim() || null } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatarColor: true } },
      _count: { select: { tasks: true, members: true } },
    },
  });

  return NextResponse.json({ project: updatedProject });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
  }

  if (project.ownerId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ Chủ dự án hoặc Quản trị viên mới có thể xóa dự án" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: projectId } });
  return NextResponse.json({ ok: true });
}
