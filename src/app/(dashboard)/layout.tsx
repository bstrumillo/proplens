import { redirect } from "next/navigation";
import { getSessionState } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const state = await getSessionState();

  if (state.status === "unauthenticated") {
    redirect("/login");
  }
  if (state.status === "no-organization") {
    redirect("/onboarding");
  }

  const session = state.session;
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, session.organizationId),
  });

  return (
    <DashboardShell
      user={{
        name: session.user.name,
        email: session.user.email,
      }}
      org={{
        name: org?.name ?? "My Organization",
      }}
    >
      {children}
    </DashboardShell>
  );
}
