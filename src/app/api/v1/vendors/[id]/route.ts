import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import {
  getVendorById,
  updateVendor,
  deleteVendor,
} from "@/lib/services/vendors";
import { updateVendorSchema } from "@/lib/validators/vendors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const vendor = await getVendorById(auth.organizationId, id);

    if (!vendor) {
      return apiError("Vendor not found", 404);
    }

    return apiSuccess(vendor);
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
    const validated = updateVendorSchema.parse(body);
    const vendor = await updateVendor(auth.organizationId, id, validated);
    return apiSuccess(vendor);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    if (error instanceof Error && error.message === "Vendor not found") {
      return apiError("Vendor not found", 404);
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
    await deleteVendor(auth.organizationId, id);
    return apiSuccess({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Vendor not found") {
      return apiError("Vendor not found", 404);
    }
    return apiError("Internal server error", 500);
  }
}
