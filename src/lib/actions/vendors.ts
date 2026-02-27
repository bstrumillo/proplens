"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createVendorSchema, updateVendorSchema } from "@/lib/validators/vendors";
import {
  createVendor,
  updateVendor,
  deleteVendor,
} from "@/lib/services/vendors";
import { uuidSchema } from "@/lib/validators/shared";
import type { ActionResult } from "@/lib/services/types";
import type { Vendor } from "@/types";

function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      obj[key] = value;
    }
  });
  return obj;
}

export async function createVendorAction(
  formData: FormData
): Promise<ActionResult<Vendor>> {
  try {
    const session = await requireSession();
    const raw = formDataToObject(formData);
    const parsed = createVendorSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const vendor = await createVendor(session.organizationId, parsed.data);
    revalidatePath("/maintenance/vendors");

    return { success: true, data: vendor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create vendor",
    };
  }
}

export async function updateVendorAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Vendor>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid vendor ID" };
    }

    const raw = formDataToObject(formData);
    const parsed = updateVendorSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const vendor = await updateVendor(session.organizationId, idParsed.data, parsed.data);
    revalidatePath("/maintenance/vendors");
    revalidatePath(`/maintenance/vendors/${id}`);

    return { success: true, data: vendor };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update vendor",
    };
  }
}

export async function deleteVendorAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid vendor ID" };
    }

    await deleteVendor(session.organizationId, idParsed.data);
    revalidatePath("/maintenance/vendors");

    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete vendor",
    };
  }
}
