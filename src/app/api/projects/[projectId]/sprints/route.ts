import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/bus";

const createSchema = z.object({
  name: z.string().min(2).max(100),
  goal: z.string().max(300).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const user = await requireUser();
  const { projectId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

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
