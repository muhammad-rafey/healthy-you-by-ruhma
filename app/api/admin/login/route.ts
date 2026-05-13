import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import { ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

const Body = z.object({ password: z.string().min(1) });

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not set on server" }, { status: 500 });
  }

  const json = await request.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (parsed.data.password !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ ok: true });
}
