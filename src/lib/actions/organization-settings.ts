"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/rbac";
import { updateOrganizationSchema } from "@/lib/validators/organization";
import { updateOrganization } from "@/lib/services/organizations";
import type { ActionResult } from "@/lib/services/types";
import type { Organization } from "@/types";

export async function updateOrganizationAction(
  formData: FormData
): Promise<ActionResult<Organization>> {
  try {
    const session = await requireSession();

    if (!hasPermission(session.role, "admin")) {
      return {
        success: false,
        error: "You don't have permission to update organization settings.",
        code: "FORBIDDEN",
      };
    }

    const raw = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
    };

    const validated = updateOrganizationSchema.parse(raw);
    const organization = await updateOrganization(
      session.organizationId,
      validated
    );

    revalidatePath("/settings");
    return { success: true, data: organization };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be logged in.", code: "UNAUTHORIZED" };
    }
    if (error instanceof Error && error.message === "Organization not found") {
      return { success: false, error: "Organization not found.", code: "NOT_FOUND" };
    }
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      return {
        success: false,
        error: zodError.issues.map((i) => i.message).join(", "),
        code: "VALIDATION_ERROR",
      };
    }
    return {
      success: false,
      error: "Failed to update organization settings. Please try again.",
    };
  }
}
