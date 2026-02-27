import { eq, and, or, ilike, sql, count, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { units, buildings } from "@/lib/db/schema";
import type { Unit, Building } from "@/types";
import type { ListParams, PaginatedResult } from "./types";
import { normalizeListParams } from "./types";
import type { CreateUnitInput, UpdateUnitInput } from "@/lib/validators/units";

export type UnitWithBuilding = Unit & {
  buildingName: string;
  buildingAddress: string | null;
};

export type BuildingOption = {
  id: string;
  name: string;
  addressLine1: string | null;
};

export async function getUnits(
  organizationId: string,
  params: ListParams
): Promise<PaginatedResult<UnitWithBuilding>> {
  const { page, limit, search, sortBy, sortOrder, filters } = normalizeListParams(params);
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [eq(units.organizationId, organizationId)];

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(
        ilike(units.unitNumber, searchPattern),
        ilike(buildings.name, searchPattern)
      )!
    );
  }

  // Apply filters
  if (filters?.status && typeof filters.status === "string") {
    conditions.push(eq(units.status, filters.status as Unit["status"]));
  }

  if (filters?.buildingId && typeof filters.buildingId === "string") {
    conditions.push(eq(units.buildingId, filters.buildingId));
  }

  if (filters?.type && typeof filters.type === "string") {
    conditions.push(eq(units.type, filters.type as Unit["type"]));
  }

  const whereClause = and(...conditions);

  // Build sort
  const sortColumn = (() => {
    switch (sortBy) {
      case "unitNumber":
        return units.unitNumber;
      case "building":
        return buildings.name;
      case "status":
        return units.status;
      case "currentRent":
        return units.currentRent;
      case "createdAt":
        return units.createdAt;
      default:
        return units.createdAt;
    }
  })();

  const orderDirection = sortOrder === "asc" ? asc : desc;

  // Execute queries in parallel
  const [data, totalResult] = await Promise.all([
    db
      .select({
        id: units.id,
        organizationId: units.organizationId,
        buildingId: units.buildingId,
        unitNumber: units.unitNumber,
        type: units.type,
        status: units.status,
        floor: units.floor,
        bedrooms: units.bedrooms,
        bathrooms: units.bathrooms,
        sqft: units.sqft,
        marketRent: units.marketRent,
        currentRent: units.currentRent,
        depositAmount: units.depositAmount,
        isFurnished: units.isFurnished,
        isCorporate: units.isCorporate,
        amenities: units.amenities,
        description: units.description,
        metadata: units.metadata,
        currentTenantId: units.currentTenantId,
        currentLeaseId: units.currentLeaseId,
        createdAt: units.createdAt,
        updatedAt: units.updatedAt,
        buildingName: buildings.name,
        buildingAddress: buildings.addressLine1,
      })
      .from(units)
      .innerJoin(buildings, eq(units.buildingId, buildings.id))
      .where(whereClause)
      .orderBy(orderDirection(sortColumn))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(units)
      .innerJoin(buildings, eq(units.buildingId, buildings.id))
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    data: data as UnitWithBuilding[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUnitById(
  organizationId: string,
  id: string
): Promise<UnitWithBuilding | null> {
  const result = await db
    .select({
      id: units.id,
      organizationId: units.organizationId,
      buildingId: units.buildingId,
      unitNumber: units.unitNumber,
      type: units.type,
      status: units.status,
      floor: units.floor,
      bedrooms: units.bedrooms,
      bathrooms: units.bathrooms,
      sqft: units.sqft,
      marketRent: units.marketRent,
      currentRent: units.currentRent,
      depositAmount: units.depositAmount,
      isFurnished: units.isFurnished,
      isCorporate: units.isCorporate,
      amenities: units.amenities,
      description: units.description,
      metadata: units.metadata,
      currentTenantId: units.currentTenantId,
      currentLeaseId: units.currentLeaseId,
      createdAt: units.createdAt,
      updatedAt: units.updatedAt,
      buildingName: buildings.name,
      buildingAddress: buildings.addressLine1,
    })
    .from(units)
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(and(eq(units.id, id), eq(units.organizationId, organizationId)))
    .limit(1);

  return (result[0] as UnitWithBuilding) ?? null;
}

export async function createUnit(
  organizationId: string,
  data: CreateUnitInput
): Promise<Unit> {
  // Verify building belongs to organization
  const building = await db
    .select({ id: buildings.id })
    .from(buildings)
    .where(
      and(
        eq(buildings.id, data.buildingId),
        eq(buildings.organizationId, organizationId)
      )
    )
    .limit(1);

  if (building.length === 0) {
    throw new Error("Building not found");
  }

  const [unit] = await db
    .insert(units)
    .values({
      organizationId,
      buildingId: data.buildingId,
      unitNumber: data.unitNumber,
      type: data.type,
      floor: data.floor ? Number(data.floor) : null,
      bedrooms: data.bedrooms ? Number(data.bedrooms) : null,
      bathrooms: data.bathrooms || null,
      sqft: data.sqft || null,
      marketRent: data.marketRent || null,
      currentRent: data.currentRent || null,
      depositAmount: data.depositAmount || null,
      isFurnished: data.isFurnished ?? false,
      isCorporate: data.isCorporate ?? false,
      description: data.description || null,
    })
    .returning();

  return unit;
}

export async function updateUnit(
  organizationId: string,
  id: string,
  data: UpdateUnitInput
): Promise<Unit> {
  const updateValues: Record<string, unknown> = {};

  if (data.buildingId !== undefined) {
    // Verify new building belongs to organization
    const building = await db
      .select({ id: buildings.id })
      .from(buildings)
      .where(
        and(
          eq(buildings.id, data.buildingId),
          eq(buildings.organizationId, organizationId)
        )
      )
      .limit(1);

    if (building.length === 0) {
      throw new Error("Building not found");
    }
    updateValues.buildingId = data.buildingId;
  }

  if (data.unitNumber !== undefined) updateValues.unitNumber = data.unitNumber;
  if (data.type !== undefined) updateValues.type = data.type;
  if (data.floor !== undefined) updateValues.floor = data.floor ? Number(data.floor) : null;
  if (data.bedrooms !== undefined) updateValues.bedrooms = data.bedrooms ? Number(data.bedrooms) : null;
  if (data.bathrooms !== undefined) updateValues.bathrooms = data.bathrooms || null;
  if (data.sqft !== undefined) updateValues.sqft = data.sqft || null;
  if (data.marketRent !== undefined) updateValues.marketRent = data.marketRent || null;
  if (data.currentRent !== undefined) updateValues.currentRent = data.currentRent || null;
  if (data.depositAmount !== undefined) updateValues.depositAmount = data.depositAmount || null;
  if (data.isFurnished !== undefined) updateValues.isFurnished = data.isFurnished;
  if (data.isCorporate !== undefined) updateValues.isCorporate = data.isCorporate;
  if (data.description !== undefined) updateValues.description = data.description || null;

  const [unit] = await db
    .update(units)
    .set(updateValues)
    .where(and(eq(units.id, id), eq(units.organizationId, organizationId)))
    .returning();

  if (!unit) {
    throw new Error("Unit not found");
  }

  return unit;
}

export async function deleteUnit(
  organizationId: string,
  id: string
): Promise<void> {
  const result = await db
    .delete(units)
    .where(and(eq(units.id, id), eq(units.organizationId, organizationId)))
    .returning({ id: units.id });

  if (result.length === 0) {
    throw new Error("Unit not found");
  }
}

export async function getBuildingsForOrg(
  organizationId: string
): Promise<BuildingOption[]> {
  const result = await db
    .select({
      id: buildings.id,
      name: buildings.name,
      addressLine1: buildings.addressLine1,
    })
    .from(buildings)
    .where(eq(buildings.organizationId, organizationId))
    .orderBy(asc(buildings.name));

  return result;
}
