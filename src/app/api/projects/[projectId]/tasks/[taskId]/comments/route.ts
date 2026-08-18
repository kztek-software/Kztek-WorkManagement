import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { publish } from "@/lib/bus";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const user = await requireUser();
  const { projectId, taskId } = await params;

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: user.id } },
  });
  if (!member) return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });

  const [comments, activity] = await Promise.all([
    prisma.comment.findMany({
      where: { taskId },
      include: { author: { select: { id: true, name: true, avatarColor: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.activity.findMany({
      where: { taskId },
      include: { actor: { select: { id: true, name: true, avatarColor: true } } },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return NextResponse.json({ comments, activity });
}

const commentSchema = z.object({ body: z.string().min(1).max(2000) });

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
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Bình luận không được để trống" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { taskId, authorId: user.id, body: parsed.data.body },
    include: { author: { select: { id: true, name: true, avatarColor: true } } },
  });

  await prisma.activity.create({
    data: { taskId, actorId: user.id, action: "COMMENTED", detail: "đã bình luận" },
  });

  publish(projectId, { type: "TASK_CHANGED", taskId, actorId: user.id });
  return NextResponse.json({ comment }, { status: 201 });
}
