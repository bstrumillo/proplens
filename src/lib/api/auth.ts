import { requireSession } from "@/lib/auth/session";

export async function authenticateApiRequest(): Promise<{
  organizationId: string;
  userId: string;
} | null> {
  try {
    const session = await requireSession();
    return {
      organizationId: session.organizationId,
      userId: session.user.id,
    };
  } catch {
    return null;
  }
}
