import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  await destroySession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set("flowboard_session", "", {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
    maxAge: 0,
    path: "/",
  });
  return res;
}
