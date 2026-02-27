import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizationMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
};

export type SessionContext = {
  user: SessionUser;
  organizationId: string;
  role: "owner" | "admin" | "manager" | "staff" | "viewer";
};

export async function getSession(): Promise<SessionContext | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return null;

    // Look up the user's default organization membership
    const membership = await db.query.organizationMembers.findFirst({
      where: eq(organizationMembers.userId, session.user.id),
      orderBy: (members, { desc }) => [desc(members.isDefault)],
    });

    if (!membership) return null;

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      organizationId: membership.organizationId,
      role: membership.role as SessionContext["role"],
    };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
