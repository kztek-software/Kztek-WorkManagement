import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { ALL_PERMISSION_KEYS } from "@/lib/permissions";
import { checkUserPermission, invalidateRolePermissionsCache } from "@/lib/permissions-server";

const updateRoleSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  description: z.string().optional().nullable(),
  color: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

// PATCH /api/roles/[roleKey] — Cập nhật phân quyền và thông tin vai trò
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ roleKey: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const permCheck = await checkUserPermission(user.id, "roles.manage", undefined, user.role);
  if (!permCheck.allowed) {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền sửa phân quyền" }, { status: 403 });
  }

  const { roleKey } = await context.params;
  const key = roleKey.toUpperCase();

  const roleDef = await prisma.roleDefinition.findUnique({ where: { key } });
  if (!roleDef) {
    return NextResponse.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" },
      { status: 400 }
    );
  }

  // Đối với ADMIN: Luôn giữ toàn quyền
  const newPermissions = key === "ADMIN" ? ALL_PERMISSION_KEYS : parsed.data.permissions;

  const updated = await prisma.roleDefinition.update({
    where: { key },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
      ...(parsed.data.color ? { color: parsed.data.color } : {}),
      ...(newPermissions ? { permissions: JSON.stringify(newPermissions) } : {}),
    },
  });

  // Xóa cache permissions để role mới có hiệu lực ngay lập tức
  invalidateRolePermissionsCache();

  return NextResponse.json({
    role: {
      id: updated.id,
      key: updated.key,
      name: updated.name,
      description: updated.description,
      color: updated.color,
      isSystem: updated.isSystem,
      permissions: newPermissions ?? JSON.parse(updated.permissions),
    },
  });
}

// DELETE /api/roles/[roleKey] — Xóa vai trò tùy chỉnh
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ roleKey: string }> }
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  const permCheck = await checkUserPermission(user.id, "roles.manage", undefined, user.role);
  if (!permCheck.allowed) {
    return NextResponse.json({ error: "Chỉ Quản trị viên mới có quyền xóa vai trò" }, { status: 403 });
  }

  const { roleKey } = await context.params;
  const key = roleKey.toUpperCase();

  const roleDef = await prisma.roleDefinition.findUnique({ where: { key } });
  if (!roleDef) {
    return NextResponse.json({ error: "Không tìm thấy vai trò" }, { status: 404 });
  }

  if (roleDef.isSystem) {
    return NextResponse.json({ error: `Không thể xóa vai trò hệ thống mặc định (${roleDef.name})` }, { status: 400 });
  }

  // Chuyển tất cả user đang giữ role này về MEMBER
  await prisma.user.updateMany({
    where: { role: key },
    data: { role: "MEMBER" },
  });
  await prisma.projectMember.updateMany({
    where: { role: key },
    data: { role: "MEMBER" },
  });

  await prisma.roleDefinition.delete({ where: { key } });

  // Xóa cache để role đã xóa không còn được dùng nữa
  invalidateRolePermissionsCache();

  return NextResponse.json({ success: true });
}
