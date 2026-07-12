import { NextRequest, NextResponse } from "next/server";
import { gateCookieValue, gateEnabled, GATE_COOKIE } from "@/lib/auth/gate";

export async function POST(request: NextRequest) {
  if (!gateEnabled()) {
    return NextResponse.json({ error: "Gate is disabled" }, { status: 404 });
  }

  const { password } = await request.json();

  if (password !== process.env.GATE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(GATE_COOKIE, await gateCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
