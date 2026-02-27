import { db } from "@/lib/db";
import { buildings, properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Building } from "@/types";
import type { CreateBuildingInput, UpdateBuildingInput } from "@/lib/validators/properties";

export async function getBuildings(
  organizationId: string,
  propertyId: string
): Promise<Building[]> {
  return db
    .select()
    .from(buildings)
    .where(
      and(
        eq(buildings.organizationId, organizationId),
        eq(buildings.propertyId, propertyId)
      )
    )
    .orderBy(buildings.name);
}

export async function getBuildingById(
  organizationId: string,
  id: string
): Promise<Building | null> {
  const result = await db
    .select()
    .from(buildings)
    .where(
      and(eq(buildings.id, id), eq(buildings.organizationId, organizationId))
    )
    .limit(1);

  return result[0] ?? null;
}

export async function createBuilding(
  organizationId: string,
  data: CreateBuildingInput & { propertyId: string }
): Promise<Building> {
  // Verify property belongs to organization
  const property = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.id, data.propertyId),
        eq(properties.organizationId, organizationId)
      )
    )
    .limit(1);

  if (!property[0]) {
    throw new Error("Property not found");
  }

  const [building] = await db
    .insert(buildings)
    .values({
      organizationId,
      propertyId: data.propertyId,
      name: data.name,
      addressLine1: data.addressLine1 || null,
      totalUnits: data.totalUnits ?? 0,
      floors: data.floors ? Number(data.floors) : null,
      yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : null,
    })
    .returning();

  // Update property total units
  await updatePropertyTotalUnits(organizationId, data.propertyId);

  return building;
}

export async function updateBuilding(
  organizationId: string,
  id: string,
  data: UpdateBuildingInput
): Promise<Building> {
  const existing = await getBuildingById(organizationId, id);
  if (!existing) {
    throw new Error("Building not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.addressLine1 !== undefined)
    updateData.addressLine1 = data.addressLine1 || null;
  if (data.totalUnits !== undefined) updateData.totalUnits = data.totalUnits;
  if (data.floors !== undefined)
    updateData.floors = data.floors ? Number(data.floors) : null;
  if (data.yearBuilt !== undefined)
    updateData.yearBuilt = data.yearBuilt ? Number(data.yearBuilt) : null;

  const [building] = await db
    .update(buildings)
    .set(updateData)
    .where(
      and(eq(buildings.id, id), eq(buildings.organizationId, organizationId))
    )
    .returning();

  // Update property total units if totalUnits changed
  if (data.totalUnits !== undefined) {
    await updatePropertyTotalUnits(organizationId, existing.propertyId);
  }

  return building;
}

export async function deleteBuilding(
  organizationId: string,
  id: string
): Promise<void> {
  const existing = await getBuildingById(organizationId, id);
  if (!existing) {
    throw new Error("Building not found");
  }

  await db
    .delete(buildings)
    .where(
      and(eq(buildings.id, id), eq(buildings.organizationId, organizationId))
    );

  // Update property total units
  await updatePropertyTotalUnits(organizationId, existing.propertyId);
}

async function updatePropertyTotalUnits(
  organizationId: string,
  propertyId: string
): Promise<void> {
  const propertyBuildings = await getBuildings(organizationId, propertyId);
  const totalUnits = propertyBuildings.reduce(
    (sum, b) => sum + (b.totalUnits ?? 0),
    0
  );

  await db
    .update(properties)
    .set({ totalUnits })
    .where(
      and(
        eq(properties.id, propertyId),
        eq(properties.organizationId, organizationId)
      )
    );
}
