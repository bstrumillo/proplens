import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api/response";
import { getVendors, createVendor } from "@/lib/services/vendors";
import { createVendorSchema } from "@/lib/validators/vendors";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { searchParams } = request.nextUrl;
    const result = await getVendors(auth.organizationId, {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
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
    const validated = createVendorSchema.parse(body);
    const vendor = await createVendor(auth.organizationId, validated);
    return apiSuccess(vendor, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    return apiError("Internal server error", 500);
  }
}
