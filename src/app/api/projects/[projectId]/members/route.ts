import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageMembers } from "@/lib/permissions";

const addMemberSchema = z.object({
  userId: z.string().min(1),
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
  if (!currentMember) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const [members, allUsers, project] = await Promise.all([
    prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarColor: true, title: true } },
      },
      orderBy: { role: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, avatarColor: true, title: true },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    }),
  ]);

  const memberUserIds = new Set(members.map((m) => m.userId));
  const nonMembers = allUsers.filter((u) => !memberUserIds.has(u.id));

  return NextResponse.json({
    members,
    nonMembers,
    currentRole: currentMember.role,
    ownerId: project?.ownerId,
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
  if (!currentMember || !canManageMembers(currentMember.role)) {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền thêm thành viên" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = addMemberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: parsed.data.userId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Người dùng đã là thành viên dự án" }, { status: 400 });
  }

  const newMember = await prisma.projectMember.create({
    data: {
      projectId,
      userId: parsed.data.userId,
      role: parsed.data.role,
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarColor: true, title: true } },
    },
  });

  return NextResponse.json({ member: newMember }, { status: 201 });
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
