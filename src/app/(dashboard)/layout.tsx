import { getSession } from "@/lib/auth/session";

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
  const session = await getSession();

  const org = session
    ? await db.query.organizations.findFirst({
        where: eq(organizations.id, session.organizationId),
      })
    : null;

  return (
    <DashboardShell
      user={{
        name: session?.user.name ?? "User",
        email: session?.user.email ?? "",
      }}
      org={{
        name: org?.name ?? "My Organization",
      }}
    >
      {children}
    </DashboardShell>
  );
}
