import { cache } from "react";
import { headers } from "next/headers";
import { desc, asc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizationMembers } from "@/lib/db/schema";
import type { Role } from "@/lib/auth/rbac";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type SessionContext = {
  user: SessionUser;
  organizationId: string;
  role: Role;
};

// Distinguishes "not logged in" (→ /login) from "logged in but hasn't
// created/joined an organization yet" (→ /onboarding).
export type SessionState =
  | { status: "unauthenticated" }
  | { status: "no-organization"; user: SessionUser }
  | { status: "active"; session: SessionContext };

export const getSessionState = cache(async (): Promise<SessionState> => {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!authSession?.user) {
    return { status: "unauthenticated" };
  }

  const sessionUser: SessionUser = {
    id: authSession.user.id,
    email: authSession.user.email,
    name: authSession.user.name,
  };

  const membership = await db.query.organizationMembers.findFirst({
    where: eq(organizationMembers.userId, sessionUser.id),
    orderBy: [
      desc(organizationMembers.isDefault),
      asc(organizationMembers.createdAt),
    ],
  });

  if (!membership) {
    return { status: "no-organization", user: sessionUser };
  }

  return {
    status: "active",
    session: {
      user: sessionUser,
      organizationId: membership.organizationId,
      role: membership.role,
    },
  };
});

export async function getSession(): Promise<SessionContext | null> {
  const state = await getSessionState();
  return state.status === "active" ? state.session : null;
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
