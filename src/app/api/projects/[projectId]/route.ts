import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageMembers } from "@/lib/permissions";
import { checkUserPermission } from "@/lib/permissions-server";

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
  key: z.string().min(2).max(6).regex(/^[A-Z][A-Z0-9]*$/, "Key phải viết hoa, bắt đầu bằng chữ").optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  ownerId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const permCheck = await checkUserPermission(user.id, "projects.edit", projectId, user.role);
  if (!permCheck.allowed) {
    return NextResponse.json({ error: permCheck.reason || "Không có quyền chỉnh sửa dự án này" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu cập nhật không hợp lệ" },
      { status: 400 }
    );
  }

  const { name, key, description, status, ownerId } = parsed.data;

  // Kiểm tra trùng Key nếu có thay đổi key
  if (key) {
    const existing = await prisma.project.findFirst({
      where: { key, NOT: { id: projectId } },
    });
    if (existing) {
      return NextResponse.json({ error: `Mã Key "${key}" đã tồn tại trên dự án khác` }, { status: 409 });
    }
  }

  // Nếu chuyển giao Owner
  if (ownerId) {
    const targetUser = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Người dùng được chọn làm Chủ dự án không tồn tại" }, { status: 400 });
    }

    // Đảm bảo user mới có mặt trong projectMembers với role OWNER
    await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId: ownerId } },
      update: { role: "OWNER" },
      create: { projectId, userId: ownerId, role: "OWNER" },
    });
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(key ? { key: key.trim().toUpperCase() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(status ? { status } : {}),
      ...(ownerId ? { ownerId } : {}),
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatarColor: true, title: true } },
      _count: { select: { tasks: true, members: true, customerTickets: true } },
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
    select: { id: true, name: true, key: true, ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Không tìm thấy dự án" }, { status: 404 });
  }

  const permCheck = await checkUserPermission(user.id, "projects.delete", projectId, user.role);
  if (!permCheck.allowed) {
    return NextResponse.json({ error: permCheck.reason || "Chỉ Chủ dự án hoặc Quản trị viên mới có thể xóa dự án này" }, { status: 403 });
  }

  // Xóa toàn bộ dữ liệu phụ thuộc một cách an toàn và triệt để trong Transaction
  await prisma.$transaction(async (tx) => {
    // 1. Tìm tất cả task IDs trong project
    const tasks = await tx.task.findMany({
      where: { projectId },
      select: { id: true },
    });
    const taskIds = tasks.map((t) => t.id);

    if (taskIds.length > 0) {
      await tx.subtask.deleteMany({ where: { taskId: { in: taskIds } } });
      await tx.comment.deleteMany({ where: { taskId: { in: taskIds } } });
      await tx.activity.deleteMany({ where: { taskId: { in: taskIds } } });
      await tx.taskLabel.deleteMany({ where: { taskId: { in: taskIds } } });
      await tx.attachment.deleteMany({ where: { taskId: { in: taskIds } } });
    }

    // 2. Tìm tất cả customer tickets trong project
    const tickets = await tx.customerTicket.findMany({
      where: { projectId },
      select: { id: true },
    });
    const ticketIds = tickets.map((t) => t.id);

    if (ticketIds.length > 0) {
      await tx.ticketComment.deleteMany({ where: { ticketId: { in: ticketIds } } });
      await tx.attachment.deleteMany({ where: { ticketId: { in: ticketIds } } });
      await tx.customerTicket.deleteMany({ where: { projectId } });
    }

    // 3. Xóa các thực thể cấp dự án
    await tx.task.deleteMany({ where: { projectId } });
    await tx.sprint.deleteMany({ where: { projectId } });
    await tx.label.deleteMany({ where: { projectId } });
    await tx.projectMember.deleteMany({ where: { projectId } });

    // 4. Xóa chính Project
    await tx.project.delete({ where: { id: projectId } });
  });

  return NextResponse.json({ ok: true, message: `Đã xóa vĩnh viễn dự án ${project.name}` });
}

