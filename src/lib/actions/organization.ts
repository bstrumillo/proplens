"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, organizationMembers } from "@/lib/db/schema";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createOrganizationAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "You must be logged in to create an organization." };
  }

  const name = formData.get("name") as string | null;
  const slugInput = formData.get("slug") as string | null;

  if (!name || name.trim().length === 0) {
    return { error: "Organization name is required." };
  }

  const slug = slugInput?.trim() || generateSlug(name);

  if (slug.length < 2) {
    return { error: "Slug must be at least 2 characters." };
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug can only contain lowercase letters, numbers, and hyphens." };
  }

  try {
    const [org] = await db
      .insert(organizations)
      .values({
        name: name.trim(),
        slug,
      })
      .returning();

    await db.insert(organizationMembers).values({
      organizationId: org.id,
      userId: session.user.id,
      role: "owner",
      isDefault: true,
      acceptedAt: new Date(),
    });

    return { success: true, organizationId: org.id };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message.includes("unique")
    ) {
      return { error: "An organization with that slug already exists. Please choose a different one." };
    }
    return { error: "Failed to create organization. Please try again." };
  }
}
