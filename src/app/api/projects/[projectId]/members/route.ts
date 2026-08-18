import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageMembers } from "@/lib/permissions";

const addMemberSchema = z.object({
  userId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  teamId: z.string().optional(),
  teamIds: z.array(z.string()).optional(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "MEMBER", "VIEWER"]),
});

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
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const [members, allUsers, teams, project] = await Promise.all([
    prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarColor: true,
            title: true,
            teamId: true,
            team: { select: { id: true, name: true, code: true, color: true } },
          },
        },
      },
      orderBy: { role: "asc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatarColor: true,
        title: true,
        teamId: true,
        team: { select: { id: true, name: true, code: true, color: true } },
      },
    }),
    prisma.team.findMany({
      include: {
        members: {
          select: { id: true, name: true, email: true, avatarColor: true, title: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, name: true, key: true },
    }),
  ]);

  const memberUserIds = new Set(members.map((m) => m.userId));
  const nonMembers = allUsers.filter((u) => !memberUserIds.has(u.id));

  return NextResponse.json({
    members,
    nonMembers,
    teams,
    currentRole: currentMember?.role || (user.role === "ADMIN" ? "ADMIN" : "VIEWER"),
    ownerId: project?.ownerId,
    project,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const currentMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if ((!currentMember || !canManageMembers(currentMember.role)) && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền thêm thành viên" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { userId, userIds, teamId, teamIds, role } = parsed.data;
  const targetUserIds = new Set<string>();

  if (userId) targetUserIds.add(userId);
  if (userIds && userIds.length > 0) {
    userIds.forEach((id) => targetUserIds.add(id));
  }

  const allTeamIds = [...(teamId ? [teamId] : []), ...(teamIds || [])];
  if (allTeamIds.length > 0) {
    const teamMembers = await prisma.user.findMany({
      where: { teamId: { in: allTeamIds } },
      select: { id: true },
    });
    teamMembers.forEach((tm) => targetUserIds.add(tm.id));
  }

  if (targetUserIds.size === 0) {
    return NextResponse.json({ error: "Vui lòng chọn ít nhất một thành viên hoặc phòng ban" }, { status: 400 });
  }

  // Lọc ra các user chưa có trong dự án
  const existingMembers = await prisma.projectMember.findMany({
    where: { projectId, userId: { in: Array.from(targetUserIds) } },
    select: { userId: true },
  });
  const existingSet = new Set(existingMembers.map((em) => em.userId));
  const toAddUserIds = Array.from(targetUserIds).filter((id) => !existingSet.has(id));

  if (toAddUserIds.length === 0) {
    return NextResponse.json({ error: "Tất cả người dùng được chọn đã là thành viên dự án" }, { status: 400 });
  }

  await prisma.projectMember.createMany({
    data: toAddUserIds.map((uid) => ({
      projectId,
      userId: uid,
      role,
    })),
  });

  const newMembers = await prisma.projectMember.findMany({
    where: { projectId, userId: { in: toAddUserIds } },
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
  });

  return NextResponse.json({
    message: `Đã thêm ${newMembers.length} thành viên vào dự án`,
    addedCount: newMembers.length,
    members: newMembers,
  }, { status: 201 });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const currentMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!currentMember || !canManageMembers(currentMember.role)) {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền thay đổi phân quyền" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: parsed.data.userId } },
  });
  if (!targetMember) {
    return NextResponse.json({ error: "Không tìm thấy thành viên" }, { status: 404 });
  }

  // Không thể hạ quyền Owner trừ khi người thao tác là Owner
  if (targetMember.role === "OWNER" && currentMember.role !== "OWNER") {
    return NextResponse.json({ error: "Không thể thay đổi quyền của Chủ dự án" }, { status: 403 });
  }

  const updated = await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId: parsed.data.userId } },
    data: { role: parsed.data.role },
    include: {
      user: { select: { id: true, name: true, email: true, avatarColor: true, title: true } },
    },
  });

  return NextResponse.json({ member: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const currentMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!currentMember || !canManageMembers(currentMember.role)) {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền xóa thành viên" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");
  if (!targetUserId) {
    return NextResponse.json({ error: "Thiếu userId" }, { status: 400 });
  }

  const targetMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });
  if (!targetMember) {
    return NextResponse.json({ error: "Không tìm thấy thành viên" }, { status: 404 });
  }

  if (targetMember.role === "OWNER") {
    return NextResponse.json({ error: "Không thể xóa Chủ dự án" }, { status: 400 });
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: targetUserId } },
  });

  return NextResponse.json({ ok: true });
}
