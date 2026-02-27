"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import {
  createPropertySchema,
  updatePropertySchema,
} from "@/lib/validators/properties";
import {
  createProperty,
  updateProperty,
  deleteProperty,
} from "@/lib/services/properties";
import type { ActionResult } from "@/lib/services/types";
import type { Property } from "@/types";

export async function createPropertyAction(
  formData: FormData
): Promise<ActionResult<Property>> {
  try {
    const session = await requireSession();

    const raw = {
      name: formData.get("name") as string,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: formData.get("addressLine2") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      type: formData.get("type") as string,
      yearBuilt: formData.get("yearBuilt") as string,
      totalSqft: formData.get("totalSqft") as string,
      purchasePrice: formData.get("purchasePrice") as string,
      description: formData.get("description") as string,
    };

    const validated = createPropertySchema.parse(raw);
    const property = await createProperty(session.organizationId, validated);

    revalidatePath("/properties");
    return { success: true, data: property };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be logged in.", code: "UNAUTHORIZED" };
    }
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      return {
        success: false,
        error: zodError.issues.map((i) => i.message).join(", "),
        code: "VALIDATION_ERROR",
      };
    }
    return { success: false, error: "Failed to create property. Please try again." };
  }
}

export async function updatePropertyAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Property>> {
  try {
    const session = await requireSession();

    const raw: Record<string, string> = {};
    formData.forEach((value, key) => {
      raw[key] = value as string;
    });

    const validated = updatePropertySchema.parse(raw);
    const property = await updateProperty(session.organizationId, id, validated);

    revalidatePath("/properties");
    revalidatePath(`/properties/${id}`);
    return { success: true, data: property };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be logged in.", code: "UNAUTHORIZED" };
    }
    if (error instanceof Error && error.message === "Property not found") {
      return { success: false, error: "Property not found.", code: "NOT_FOUND" };
    }
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      return {
        success: false,
        error: zodError.issues.map((i) => i.message).join(", "),
        code: "VALIDATION_ERROR",
      };
    }
    return { success: false, error: "Failed to update property. Please try again." };
  }
}

export async function deletePropertyAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();
    await deleteProperty(session.organizationId, id);

    revalidatePath("/properties");
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be logged in.", code: "UNAUTHORIZED" };
    }
    if (error instanceof Error && error.message === "Property not found") {
      return { success: false, error: "Property not found.", code: "NOT_FOUND" };
    }
    return { success: false, error: "Failed to delete property. Please try again." };
  }
}
