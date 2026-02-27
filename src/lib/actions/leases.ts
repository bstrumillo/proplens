"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createLeaseSchema, updateLeaseSchema } from "@/lib/validators/leases";
import {
  createLease,
  updateLease,
  deleteLease,
} from "@/lib/services/leases";
import { uuidSchema } from "@/lib/validators/shared";
import type { ActionResult } from "@/lib/services/types";
import type { Lease } from "@/types";

function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      obj[key] = value;
    }
  });
  return obj;
}

export async function createLeaseAction(
  formData: FormData
): Promise<ActionResult<Lease>> {
  try {
    const session = await requireSession();
    const raw = formDataToObject(formData);
    const parsed = createLeaseSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const lease = await createLease(session.organizationId, parsed.data);
    revalidatePath("/leases");

    return { success: true, data: lease };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create lease",
    };
  }
}

export async function updateLeaseAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Lease>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid lease ID" };
    }

    const raw = formDataToObject(formData);
    const parsed = updateLeaseSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const lease = await updateLease(session.organizationId, idParsed.data, parsed.data);
    revalidatePath("/leases");
    revalidatePath(`/leases/${id}`);

    return { success: true, data: lease };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update lease",
    };
  }
}

export async function deleteLeaseAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid lease ID" };
    }

    await deleteLease(session.organizationId, idParsed.data);
    revalidatePath("/leases");

    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete lease",
    };
  }
}
