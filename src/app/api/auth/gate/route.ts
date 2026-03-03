import { NextRequest, NextResponse } from "next/server";

const GATE_PASSWORD = process.env.GATE_PASSWORD ?? "doublejack2024";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== GATE_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("proplens-gate", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
