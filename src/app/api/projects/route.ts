import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { LABEL_COLORS } from "@/lib/constants";

export async function GET() {
  const user = await requireUser();
  const projects = await prisma.project.findMany({
    where: { members: { some: { userId: user.id } } },
    include: {
      _count: { select: { tasks: true, members: true } },
      members: { include: { user: { select: { id: true, name: true, avatarColor: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ projects });
}

const createSchema = z.object({
  name: z.string().min(2).max(80),
  key: z.string().min(2).max(6).regex(/^[A-Z][A-Z0-9]*$/),
  description: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Tên ≥ 2 ký tự; key gồm 2-6 chữ cái in hoa (VD: FB)" },
      { status: 400 }
    );
  }

  const existing = await prisma.project.findUnique({ where: { key: parsed.data.key } });
  if (existing) {
    return NextResponse.json({ error: `Key "${parsed.data.key}" đã tồn tại` }, { status: 409 });
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      key: parsed.data.key,
      description: parsed.data.description,
      ownerId: user.id,
      members: { create: { userId: user.id, role: "OWNER" } },
      labels: {
        create: ["frontend", "backend", "bug", "design"].map((name, i) => ({
          name,
          color: LABEL_COLORS[i % LABEL_COLORS.length],
        })),
      },
    },
  });

  return NextResponse.json({ project }, { status: 201 });
}
