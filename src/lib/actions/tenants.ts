"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createTenantSchema, updateTenantSchema } from "@/lib/validators/tenants";
import {
  createTenant,
  updateTenant,
  deleteTenant,
} from "@/lib/services/tenants";
import { uuidSchema } from "@/lib/validators/shared";
import type { ActionResult } from "@/lib/services/types";
import type { Tenant } from "@/types";

function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      obj[key] = value;
    }
  });
  return obj;
}

export async function createTenantAction(
  formData: FormData
): Promise<ActionResult<Tenant>> {
  try {
    const session = await requireSession();
    const raw = formDataToObject(formData);
    const parsed = createTenantSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const tenant = await createTenant(session.organizationId, parsed.data);
    revalidatePath("/tenants");

    return { success: true, data: tenant };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tenant",
    };
  }
}

export async function updateTenantAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Tenant>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid tenant ID" };
    }

    const raw = formDataToObject(formData);
    const parsed = updateTenantSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const tenant = await updateTenant(session.organizationId, idParsed.data, parsed.data);
    revalidatePath("/tenants");
    revalidatePath(`/tenants/${id}`);

    return { success: true, data: tenant };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update tenant",
    };
  }
}

export async function deleteTenantAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid tenant ID" };
    }

    await deleteTenant(session.organizationId, idParsed.data);
    revalidatePath("/tenants");

    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete tenant",
    };
  }
}
