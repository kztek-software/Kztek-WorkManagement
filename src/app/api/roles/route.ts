import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  PERMISSION_CATEGORIES,
  ALL_PERMISSION_KEYS,
} from "@/lib/permissions";
import { ensureDefaultRoles } from "@/lib/permissions-server";

const createRoleSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[A-Z0-9_]+$/, "Key vai trò phải là chữ in hoa, số hoặc gạch dưới (VD: QA_LEAD, DESIGNER)"),
  name: z.string().min(2).max(60),
  description: z.string().optional(),
  color: z.string().default("#6366f1"),
  permissions: z.array(z.string()),
});

// GET /api/roles — Lấy danh sách vai trò và ma trận quyền
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  // Khởi tạo các vai trò mẫu nếu DB rỗng
  await ensureDefaultRoles();

  const roleDefs = await prisma.roleDefinition.findMany({
    orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
  });

  // Đếm số lượng thành viên đang giữ từng vai trò
  const users = await prisma.user.findMany({ select: { role: true } });
  const members = await prisma.projectMember.findMany({ select: { role: true } });

  const roleCounts: Record<string, number> = {};
  users.forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });
  members.forEach((m) => {
    roleCounts[m.role] = (roleCounts[m.role] || 0) + 1;
  });

  const roles = roleDefs.map((r) => {
    let parsedPerms: string[] = [];
    try {
      parsedPerms = JSON.parse(r.permissions);
    } catch {
      parsedPerms = [];
    }

    return {
      id: r.id,
      key: r.key,
      name: r.name,
      description: r.description,
      color: r.color,
      isSystem: r.isSystem,
      permissions: parsedPerms,
      userCount: roleCounts[r.key] || 0,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  });

  return NextResponse.json({
    roles,
    categories: PERMISSION_CATEGORIES,
    allPermissions: ALL_PERMISSION_KEYS,
  });
}

// POST /api/roles — Tạo vai trò tùy chỉnh mới
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Chỉ Quản trị viên (Admin) mới có quyền tạo vai trò mới" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createRoleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dữ liệu vai trò không hợp lệ" },
      { status: 400 }
    );
  }

  const key = parsed.data.key.toUpperCase();
  const existing = await prisma.roleDefinition.findUnique({ where: { key } });
  if (existing) {
    return NextResponse.json({ error: `Mã vai trò "${key}" đã tồn tại trong hệ thống` }, { status: 409 });
  }

  const newRole = await prisma.roleDefinition.create({
    data: {
      key,
      name: parsed.data.name,
      description: parsed.data.description,
      color: parsed.data.color,
      isSystem: false,
      permissions: JSON.stringify(parsed.data.permissions),
    },
  });

  return NextResponse.json({
    role: {
      id: newRole.id,
      key: newRole.key,
      name: newRole.name,
      description: newRole.description,
      color: newRole.color,
      isSystem: newRole.isSystem,
      permissions: parsed.data.permissions,
      userCount: 0,
    },
  }, { status: 201 });
}
