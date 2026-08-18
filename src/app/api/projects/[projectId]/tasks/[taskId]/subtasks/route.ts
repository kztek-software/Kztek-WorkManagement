import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/bus";

const createSchema = z.object({ title: z.string().min(1).max(200) });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const user = await requireUser();
  const { projectId, taskId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tiêu đề subtask không được để trống" }, { status: 400 });
  }

  const subtask = await prisma.subtask.create({
    data: { taskId, title: parsed.data.title },
  });
  publish(projectId, { type: "TASK_CHANGED", taskId, actorId: user.id });
  return NextResponse.json({ subtask }, { status: 201 });
}
