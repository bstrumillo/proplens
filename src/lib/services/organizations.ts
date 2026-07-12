import { db } from "@/lib/db";
import { organizations, organizationMembers, user } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import type { Organization } from "@/types";
import type { Role } from "@/lib/auth/rbac";
import type { UpdateOrganizationInput } from "@/lib/validators/organization";

export type OrganizationMemberWithUser = {
  id: string;
  role: Role;
  userName: string | null;
  userEmail: string | null;
  acceptedAt: Date | null;
  createdAt: Date;
};

export async function getOrganization(
  organizationId: string
): Promise<Organization | null> {
  const result = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  return result[0] ?? null;
}

export async function updateOrganization(
  organizationId: string,
  data: UpdateOrganizationInput
): Promise<Organization> {
  const existing = await getOrganization(organizationId);
  if (!existing) {
    throw new Error("Organization not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email || null;
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.address !== undefined) updateData.address = data.address || null;

  const [organization] = await db
    .update(organizations)
    .set(updateData)
    .where(eq(organizations.id, organizationId))
    .returning();

  return organization;
}

export async function listMembers(
  organizationId: string
): Promise<OrganizationMemberWithUser[]> {
  const data = await db
    .select({
      id: organizationMembers.id,
      role: organizationMembers.role,
      userName: user.name,
      userEmail: user.email,
      acceptedAt: organizationMembers.acceptedAt,
      createdAt: organizationMembers.createdAt,
    })
    .from(organizationMembers)
    .leftJoin(user, eq(organizationMembers.userId, user.id))
    .where(eq(organizationMembers.organizationId, organizationId))
    .orderBy(asc(organizationMembers.createdAt));

  return data;
}
