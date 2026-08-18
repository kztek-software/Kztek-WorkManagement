import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

const toggleSchema = z.object({ done: z.boolean() });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string; subtaskId: string }> }
) {
  const user = await requireUser();
  const { projectId, taskId, subtaskId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const subtask = await prisma.subtask.update({
    where: { id: subtaskId, taskId },
    data: { done: parsed.data.done },
  });
  return NextResponse.json({ subtask });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string; subtaskId: string }> }
) {
  const user = await requireUser();
  const { projectId, taskId, subtaskId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

  await prisma.subtask.delete({ where: { id: subtaskId, taskId } });
  return NextResponse.json({ ok: true });
}
