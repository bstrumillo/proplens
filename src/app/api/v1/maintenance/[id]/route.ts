import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import {
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from "@/lib/services/maintenance";
import { updateMaintenanceRequestSchema } from "@/lib/validators/maintenance";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const maintenanceRequest = await getMaintenanceRequestById(
      auth.organizationId,
      id
    );

    if (!maintenanceRequest) {
      return apiError("Maintenance request not found", 404);
    }

    return apiSuccess(maintenanceRequest);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateMaintenanceRequestSchema.parse(body);
    const maintenanceRequest = await updateMaintenanceRequest(
      auth.organizationId,
      id,
      validated
    );
    return apiSuccess(maintenanceRequest);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    if (
      error instanceof Error &&
      error.message === "Maintenance request not found"
    ) {
      return apiError("Maintenance request not found", 404);
    }
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    await deleteMaintenanceRequest(auth.organizationId, id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Maintenance request not found"
    ) {
      return apiError("Maintenance request not found", 404);
    }
    return apiError("Internal server error", 500);
  }
}
