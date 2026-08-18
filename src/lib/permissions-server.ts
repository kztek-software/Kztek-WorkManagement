import { prisma } from "@/lib/prisma";
import {
  ALL_PERMISSION_KEYS,
  DEFAULT_ROLE_PRESETS,
} from "@/lib/permissions";

// Khởi tạo bảng RoleDefinition trong Database nếu chưa có
export async function ensureDefaultRoles() {
  const count = await prisma.roleDefinition.count();
  if (count === 0) {
    for (const preset of DEFAULT_ROLE_PRESETS) {
      await prisma.roleDefinition.upsert({
        where: { key: preset.key },
        update: {
          name: preset.name,
          description: preset.description,
          color: preset.color,
          isSystem: preset.isSystem,
          permissions: JSON.stringify(preset.permissions),
        },
        create: {
          key: preset.key,
          name: preset.name,
          description: preset.description,
          color: preset.color,
          isSystem: preset.isSystem,
          permissions: JSON.stringify(preset.permissions),
        },
      });
    }
  }
}

// Lấy danh sách quyền của một Role từ Database (hoặc fallback về preset)
export async function getRolePermissions(roleKey: string): Promise<string[]> {
  const normKey = (roleKey || "MEMBER").toUpperCase();
  if (normKey === "ADMIN") return ALL_PERMISSION_KEYS;

  const roleDef = await prisma.roleDefinition.findUnique({
    where: { key: normKey },
  });

  if (roleDef) {
    try {
      return JSON.parse(roleDef.permissions) as string[];
    } catch {
      // fallback
    }
  }

  const preset = DEFAULT_ROLE_PRESETS.find((p) => p.key === normKey);
  return preset ? preset.permissions : DEFAULT_ROLE_PRESETS.find((p) => p.key === "MEMBER")!.permissions;
}

// Kiểm tra quyền (Check Permission)
export async function hasPermission(
  roleKey: string | undefined | null,
  requiredPermission: string
): Promise<boolean> {
  const normRole = (roleKey || "").toUpperCase();
  if (normRole === "ADMIN" || normRole === "OWNER") return true;

  const permissions = await getRolePermissions(normRole);
  return permissions.includes(requiredPermission);
}
