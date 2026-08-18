import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { suggestTask } from "@/lib/ai";

const schema = z.object({ title: z.string().min(3).max(200) });

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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Tiêu đề task ≥ 3 ký tự để AI có thể phân tích" },
      { status: 400 }
    );
  }

  const labels = await prisma.label.findMany({
    where: { projectId },
    select: { name: true },
  });

  const suggestion = await suggestTask(
    parsed.data.title,
    labels.map((l) => l.name)
  );
  return NextResponse.json({ suggestion });
}
