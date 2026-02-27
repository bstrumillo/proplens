import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getUnitById, updateUnit, deleteUnit } from "@/lib/services/units";
import { updateUnitSchema } from "@/lib/validators/units";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const unit = await getUnitById(auth.organizationId, id);

    if (!unit) {
      return apiError("Unit not found", 404);
    }

    return apiSuccess(unit);
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
    const validated = updateUnitSchema.parse(body);
    const unit = await updateUnit(auth.organizationId, id, validated);
    return apiSuccess(unit);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    if (
      error instanceof Error &&
      (error.message === "Unit not found" ||
        error.message === "Building not found")
    ) {
      return apiError(error.message, 404);
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
    await deleteUnit(auth.organizationId, id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unit not found") {
      return apiError("Unit not found", 404);
    }
    return apiError("Internal server error", 500);
  }
}
