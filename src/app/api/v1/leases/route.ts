import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api/response";
import { getLeases, createLease } from "@/lib/services/leases";
import { createLeaseSchema } from "@/lib/validators/leases";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { searchParams } = request.nextUrl;
    const result = await getLeases(auth.organizationId, {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      filters: {
        status: searchParams.get("status") || undefined,
        type: searchParams.get("type") || undefined,
      },
    });

    return apiPaginated(result);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const validated = createLeaseSchema.parse(body);
    const lease = await createLease(auth.organizationId, validated);
    return apiSuccess(lease, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    return apiError("Internal server error", 500);
  }
}
