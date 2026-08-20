import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserPermissionContext } from "@/lib/permissions-server";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  // Truyền user.role đã có sẵn để tránh query DB lần 2
  const permCtx = await getUserPermissionContext(user.id, projectId, user.role);

  return NextResponse.json({
    user,
    role: permCtx.role,
    projectRole: permCtx.projectRole,
    isAdmin: permCtx.isAdmin,
    isOwner: permCtx.isOwner,
    canCreateProject: permCtx.canCreateProject,
    permissions: permCtx.permissions,
  });
}
