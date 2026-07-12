import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { GATE_COOKIE, gateEnabled, isGatePassed } from "@/lib/auth/gate";

// Paths that skip both the gate and the session check.
const openPaths = ["/api/auth", "/api/v1/ingest", "/gate"];

// Pages that require passing the gate (when enabled) but not a session.
const authPages = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (openPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Optional pre-launch curtain in front of everything else.
  if (gateEnabled()) {
    const gateCookie = request.cookies.get(GATE_COOKIE)?.value;
    if (!(await isGatePassed(gateCookie))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/gate", request.url));
    }
  }

  // Optimistic session check (cookie presence only) — real enforcement
  // happens server-side in requireSession()/authenticateApiRequest().
  const sessionCookie = getSessionCookie(request);

  if (authPages.some((path) => pathname.startsWith(path))) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!sessionCookie) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
