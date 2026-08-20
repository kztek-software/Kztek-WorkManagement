import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/bus";
import { checkUserPermission } from "@/lib/permissions-server";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  goal: z.string().max(300).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// GET danh sách sprint của dự án — trước đây route này chỉ có POST, khiến
// mọi client gọi GET trực tiếp nhận 405. UI board/dashboard hiện lấy sprint
// gián tiếp qua endpoint /tasks nên không bị ảnh hưởng, nhưng thiếu GET ở đây
// gây khó hiểu khi debug/tích hợp — bổ sung cho đủ REST convention.
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

  const sprints = await prisma.sprint.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ sprints });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const permCheck = await checkUserPermission(user.id, "sprints.create", projectId, user.role);
  if (!permCheck.allowed) {
    return NextResponse.json({ error: permCheck.reason || "Không có quyền tạo Sprint mới" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tên sprint ≥ 2 ký tự" }, { status: 400 });
  }

  const sprint = await prisma.sprint.create({
    data: {
      projectId,
      name: parsed.data.name,
      goal: parsed.data.goal,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
    },
  });

  publish(projectId, { type: "SPRINT_CHANGED", actorId: user.id });
  return NextResponse.json({ sprint }, { status: 201 });
}
