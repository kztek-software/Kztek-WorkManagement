import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tài khoản và mật khẩu là bắt buộc" }, { status: 400 });
  }

  const input = parsed.data.email.toLowerCase().trim();
  const password = parsed.data.password;

  // Hỗ trợ đăng nhập bằng username ("admin") hoặc email ("admin@kztek.net", v.v.)
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: input },
        { email: input === "admin" ? "admin@kztek.net" : input },
        { email: `${input}@kztek.net` },
        { email: `${input}@demo.dev` },
        { name: { equals: input } },
      ],
    },
  });

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Tài khoản hoặc mật khẩu không đúng" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      title: user.title,
      role: user.role,
    },
  });
}
