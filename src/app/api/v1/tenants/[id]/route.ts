import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import {
  getTenantById,
  updateTenant,
  deleteTenant,
} from "@/lib/services/tenants";
import { updateTenantSchema } from "@/lib/validators/tenants";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const tenant = await getTenantById(auth.organizationId, id);

    if (!tenant) {
      return apiError("Tenant not found", 404);
    }

    return apiSuccess(tenant);
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
    const validated = updateTenantSchema.parse(body);
    const tenant = await updateTenant(auth.organizationId, id, validated);
    return apiSuccess(tenant);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    if (error instanceof Error && error.message === "Tenant not found") {
      return apiError("Tenant not found", 404);
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
    await deleteTenant(auth.organizationId, id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Tenant not found") {
      return apiError("Tenant not found", 404);
    }
    return apiError("Internal server error", 500);
  }
}
