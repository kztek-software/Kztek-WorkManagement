import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth";

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  title: z.string().max(100).nullable().optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const { userId } = await params;

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ" }, { status: 400 });
  }

  const { name, email, password, title, avatarColor, role } = parsed.data;

  if (email && email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email này đã tồn tại" }, { status: 400 });
    }
  }

  const updateData: {
    name?: string;
    email?: string;
    passwordHash?: string;
    title?: string | null;
    avatarColor?: string;
    role?: string;
  } = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (password) updateData.passwordHash = hashPassword(password);
  if (title !== undefined) updateData.title = title;
  if (avatarColor) updateData.avatarColor = avatarColor;
  if (role) updateData.role = role;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      title: true,
      avatarColor: true,
      role: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const currentUser = await getSessionUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const { userId } = await params;

  if (currentUser.id === userId) {
    return NextResponse.json({ error: "Không thể tự xóa tài khoản của chính mình" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });
  }

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
