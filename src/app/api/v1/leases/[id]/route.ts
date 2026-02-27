import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getLeaseById, updateLease } from "@/lib/services/leases";
import { updateLeaseSchema } from "@/lib/validators/leases";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id } = await params;
    const lease = await getLeaseById(auth.organizationId, id);

    if (!lease) {
      return apiError("Lease not found", 404);
    }

    return apiSuccess(lease);
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
    const validated = updateLeaseSchema.parse(body);
    const lease = await updateLease(auth.organizationId, id, validated);
    return apiSuccess(lease);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    if (error instanceof Error && error.message === "Lease not found") {
      return apiError("Lease not found", 404);
    }
    return apiError("Internal server error", 500);
  }
}
