"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createUnitSchema, updateUnitSchema } from "@/lib/validators/units";
import {
  createUnit,
  updateUnit,
  deleteUnit,
  getBuildingsForOrg,
} from "@/lib/services/units";
import { uuidSchema } from "@/lib/validators/shared";
import type { ActionResult } from "@/lib/services/types";
import type { Unit } from "@/types";
import type { BuildingOption } from "@/lib/services/units";

function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      obj[key] = value;
    }
  });
  return obj;
}

export async function createUnitAction(
  formData: FormData
): Promise<ActionResult<Unit>> {
  try {
    const session = await requireSession();
    const raw = formDataToObject(formData);
    const parsed = createUnitSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const unit = await createUnit(session.organizationId, parsed.data);
    revalidatePath("/units");

    return { success: true, data: unit };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create unit",
    };
  }
}

export async function updateUnitAction(
  id: string,
  formData: FormData
): Promise<ActionResult<Unit>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid unit ID" };
    }

    const raw = formDataToObject(formData);
    const parsed = updateUnitSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const unit = await updateUnit(session.organizationId, idParsed.data, parsed.data);
    revalidatePath("/units");
    revalidatePath(`/units/${id}`);

    return { success: true, data: unit };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update unit",
    };
  }
}

export async function deleteUnitAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid unit ID" };
    }

    await deleteUnit(session.organizationId, idParsed.data);
    revalidatePath("/units");

    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete unit",
    };
  }
}

export async function getBuildingsAction(): Promise<ActionResult<BuildingOption[]>> {
  try {
    const session = await requireSession();
    const buildings = await getBuildingsForOrg(session.organizationId);
    return { success: true, data: buildings };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load buildings",
    };
  }
}
