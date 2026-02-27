import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError, apiPaginated } from "@/lib/api/response";
import { getUnits, createUnit } from "@/lib/services/units";
import { createUnitSchema } from "@/lib/validators/units";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { searchParams } = request.nextUrl;
    const result = await getUnits(auth.organizationId, {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
      filters: {
        status: searchParams.get("status") || undefined,
        buildingId: searchParams.get("buildingId") || undefined,
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
    const validated = createUnitSchema.parse(body);
    const unit = await createUnit(auth.organizationId, validated);
    return apiSuccess(unit, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    if (error instanceof Error && error.message === "Building not found") {
      return apiError("Building not found", 404);
    }
    return apiError("Internal server error", 500);
  }
}
