import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { getBuildings, createBuilding } from "@/lib/services/buildings";
import { createBuildingSchema } from "@/lib/validators/properties";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id: propertyId } = await params;
    const buildings = await getBuildings(auth.organizationId, propertyId);
    return apiSuccess(buildings);
  } catch {
    return apiError("Internal server error", 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest();
  if (!auth) return apiError("Unauthorized", 401);

  try {
    const { id: propertyId } = await params;
    const body = await request.json();
    const validated = createBuildingSchema.parse(body);
    const building = await createBuilding(auth.organizationId, {
      ...validated,
      propertyId,
    });
    return apiSuccess(building, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError("Validation failed", 400, JSON.stringify(error.issues));
    }
    if (error instanceof Error && error.message === "Property not found") {
      return apiError("Property not found", 404);
    }
    return apiError("Internal server error", 500);
  }
}
