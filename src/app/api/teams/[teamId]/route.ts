import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const updateTeamSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9_]+$/, "Mã nhóm phải là chữ in hoa, số hoặc gạch dưới")
    .optional(),
  description: z.string().optional().nullable(),
  color: z.string().optional(),
  leaderId: z.string().optional().nullable(),
  memberIds: z.array(z.string()).optional(),
});

// PATCH /api/teams/[teamId] — Cập nhật thông tin nhóm & danh sách thành viên
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ Quản trị viên (Admin) mới có quyền chỉnh sửa Nhóm" }, { status: 403 });
  }

  const { teamId } = await context.params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return NextResponse.json({ error: "Không tìm thấy nhóm/phòng ban" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  const { name, code, description, color, leaderId, memberIds } = parsed.data;

  // Cập nhật thông tin cơ bản của nhóm
  await prisma.team.update({
    where: { id: teamId },
    data: {
      ...(name ? { name: name.trim() } : {}),
      ...(code ? { code: code.toUpperCase().trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(color ? { color } : {}),
      ...(leaderId !== undefined ? { leaderId: leaderId || null } : {}),
    },
  });

  // Nếu có cập nhật danh sách thành viên
  if (memberIds !== undefined) {
    // 1. Gỡ những user hiện đang trong team nhưng không có trong memberIds
    await prisma.user.updateMany({
      where: {
        teamId: teamId,
        id: { notIn: memberIds },
      },
      data: { teamId: null },
    });

    // 2. Gán teamId cho các user trong memberIds
    if (memberIds.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: memberIds } },
        data: { teamId: teamId },
      });
    }

    // 3. Nếu leader có chọn, đảm bảo leader cũng thuộc team
    if (leaderId) {
      await prisma.user.update({
        where: { id: leaderId },
        data: { teamId: teamId },
      });
    }
  }

  const updatedTeam = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      leader: {
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
        select: {
          id: true,
          name: true,
          email: true,
          avatarColor: true,
          title: true,
          role: true,
          _count: {
            select: { assignedTasks: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ team: updatedTeam });
}

// DELETE /api/teams/[teamId] — Xóa nhóm/phòng ban (tự động gỡ teamId của các thành viên)
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ teamId: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ Quản trị viên (Admin) mới có quyền xóa Nhóm" }, { status: 403 });
  }

  const { teamId } = await context.params;
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return NextResponse.json({ error: "Không tìm thấy nhóm/phòng ban" }, { status: 404 });
  }

  // Gỡ liên kết của tất cả user trong nhóm
  await prisma.user.updateMany({
    where: { teamId: teamId },
    data: { teamId: null },
  });

  await prisma.team.delete({ where: { id: teamId } });

  return NextResponse.json({ success: true });
}
