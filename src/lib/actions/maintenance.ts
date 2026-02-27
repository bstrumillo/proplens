"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import {
  createMaintenanceRequestSchema,
  updateMaintenanceRequestSchema,
} from "@/lib/validators/maintenance";
import {
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from "@/lib/services/maintenance";
import { uuidSchema } from "@/lib/validators/shared";
import type { ActionResult } from "@/lib/services/types";
import type { MaintenanceRequest } from "@/types";

function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      obj[key] = value;
    }
  });
  return obj;
}

export async function createMaintenanceRequestAction(
  formData: FormData
): Promise<ActionResult<MaintenanceRequest>> {
  try {
    const session = await requireSession();
    const raw = formDataToObject(formData);
    const parsed = createMaintenanceRequestSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const request = await createMaintenanceRequest(
      session.organizationId,
      parsed.data
    );
    revalidatePath("/maintenance");

    return { success: true, data: request };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create maintenance request",
    };
  }
}

export async function updateMaintenanceRequestAction(
  id: string,
  formData: FormData
): Promise<ActionResult<MaintenanceRequest>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid request ID" };
    }

    const raw = formDataToObject(formData);
    const parsed = updateMaintenanceRequestSchema.safeParse(raw);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Validation failed",
      };
    }

    const request = await updateMaintenanceRequest(
      session.organizationId,
      idParsed.data,
      parsed.data
    );
    revalidatePath("/maintenance");
    revalidatePath(`/maintenance/${id}`);

    return { success: true, data: request };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update maintenance request",
    };
  }
}

export async function deleteMaintenanceRequestAction(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const session = await requireSession();

    const idParsed = uuidSchema.safeParse(id);
    if (!idParsed.success) {
      return { success: false, error: "Invalid request ID" };
    }

    await deleteMaintenanceRequest(session.organizationId, idParsed.data);
    revalidatePath("/maintenance");

    return { success: true, data: { id } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete maintenance request",
    };
  }
}
