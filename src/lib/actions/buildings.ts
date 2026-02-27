"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import {
  createBuildingSchema,
  updateBuildingSchema,
} from "@/lib/validators/properties";
import {
  createBuilding,
  updateBuilding,
  deleteBuilding,
} from "@/lib/services/buildings";
import type { ActionResult } from "@/lib/services/types";
import type { Building } from "@/types";

export async function createBuildingAction(
  propertyId: string,
  formData: FormData
): Promise<ActionResult<Building>> {
  try {
    const session = await requireSession();

    const raw = {
      name: formData.get("name") as string,
      addressLine1: formData.get("addressLine1") as string,
      totalUnits: formData.get("totalUnits") as string,
      floors: formData.get("floors") as string,
      yearBuilt: formData.get("yearBuilt") as string,
    };

    const validated = createBuildingSchema.parse(raw);
    const building = await createBuilding(session.organizationId, {
      ...validated,
      propertyId,
    });

    revalidatePath(`/properties/${propertyId}`);
    revalidatePath("/properties");
    return { success: true, data: building };
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
    return { success: false, error: "Failed to create building. Please try again." };
  }
}

export async function updateBuildingAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Building>> {
  try {
    const session = await requireSession();

    const raw: Record<string, string> = {};
    formData.forEach((value, key) => {
      raw[key] = value as string;
    });

    const validated = updateBuildingSchema.parse(raw);
    const building = await updateBuilding(session.organizationId, id, validated);

    revalidatePath(`/properties/${building.propertyId}`);
    revalidatePath("/properties");
    return { success: true, data: building };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be logged in.", code: "UNAUTHORIZED" };
    }
    if (error instanceof Error && error.message === "Building not found") {
      return { success: false, error: "Building not found.", code: "NOT_FOUND" };
    }
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      return {
        success: false,
        error: zodError.issues.map((i) => i.message).join(", "),
        code: "VALIDATION_ERROR",
      };
    }
    return { success: false, error: "Failed to update building. Please try again." };
  }
}

export async function deleteBuildingAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();

    // We need to get the building to know propertyId for revalidation
    const { getBuildingById } = await import("@/lib/services/buildings");
    const building = await getBuildingById(session.organizationId, id);

    await deleteBuilding(session.organizationId, id);

    if (building) {
      revalidatePath(`/properties/${building.propertyId}`);
    }
    revalidatePath("/properties");
    return { success: true, data: { id } };
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return { success: false, error: "You must be logged in.", code: "UNAUTHORIZED" };
    }
    if (error instanceof Error && error.message === "Building not found") {
      return { success: false, error: "Building not found.", code: "NOT_FOUND" };
    }
    return { success: false, error: "Failed to delete building. Please try again." };
  }
}
