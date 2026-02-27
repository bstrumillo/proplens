import { db } from "@/lib/db";
import { properties, buildings } from "@/lib/db/schema";
import { eq, and, ilike, sql, count, desc, asc, or } from "drizzle-orm";
import type { Property } from "@/types";
import type { ListParams, PaginatedResult } from "./types";
import { normalizeListParams } from "./types";
import type { CreatePropertyInput, UpdatePropertyInput } from "@/lib/validators/properties";

export type PropertyWithBuildingCount = Property & {
  buildingCount: number;
};

export async function getProperties(
  organizationId: string,
  params: ListParams
): Promise<PaginatedResult<PropertyWithBuildingCount>> {
  const { page, limit, search, sortBy, sortOrder } = normalizeListParams(params);
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [eq(properties.organizationId, organizationId)];

  if (search) {
    conditions.push(
      or(
        ilike(properties.name, `%${search}%`),
        ilike(properties.addressLine1, `%${search}%`),
        ilike(properties.city, `%${search}%`)
      )!
    );
  }

  const whereClause = and(...conditions);

  // Build sort
  const sortColumn = (() => {
    switch (sortBy) {
      case "name":
        return properties.name;
      case "city":
        return properties.city;
      case "totalUnits":
        return properties.totalUnits;
      case "createdAt":
        return properties.createdAt;
      default:
        return properties.createdAt;
    }
  })();

  const orderDirection = sortOrder === "asc" ? asc : desc;

  // Get total count
  const [countResult] = await db
    .select({ total: count() })
    .from(properties)
    .where(whereClause);

  const total = countResult?.total ?? 0;

  // Get data with building count
  const buildingCountSubquery = db
    .select({
      propertyId: buildings.propertyId,
      count: count().as("building_count"),
    })
    .from(buildings)
    .where(eq(buildings.organizationId, organizationId))
    .groupBy(buildings.propertyId)
    .as("building_counts");

  const data = await db
    .select({
      id: properties.id,
      organizationId: properties.organizationId,
      name: properties.name,
      addressLine1: properties.addressLine1,
      addressLine2: properties.addressLine2,
      city: properties.city,
      state: properties.state,
      zipCode: properties.zipCode,
      country: properties.country,
      type: properties.type,
      status: properties.status,
      yearBuilt: properties.yearBuilt,
      totalUnits: properties.totalUnits,
      totalSqft: properties.totalSqft,
      purchasePrice: properties.purchasePrice,
      purchaseDate: properties.purchaseDate,
      currentValue: properties.currentValue,
      description: properties.description,
      metadata: properties.metadata,
      imageUrl: properties.imageUrl,
      createdAt: properties.createdAt,
      updatedAt: properties.updatedAt,
      buildingCount: sql<number>`coalesce(${buildingCountSubquery.count}, 0)`.mapWith(Number),
    })
    .from(properties)
    .leftJoin(
      buildingCountSubquery,
      eq(properties.id, buildingCountSubquery.propertyId)
    )
    .where(whereClause)
    .orderBy(orderDirection(sortColumn))
    .limit(limit)
    .offset(offset);

  return {
    data: data as PropertyWithBuildingCount[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPropertyById(
  organizationId: string,
  id: string
): Promise<Property | null> {
  const result = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.organizationId, organizationId)))
    .limit(1);

  return result[0] ?? null;
}

export async function createProperty(
  organizationId: string,
  data: CreatePropertyInput
): Promise<Property> {
  const [property] = await db
    .insert(properties)
    .values({
      organizationId,
      name: data.name,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 || null,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      type: data.type,
      yearBuilt: data.yearBuilt ? Number(data.yearBuilt) : null,
      totalSqft: data.totalSqft || null,
      purchasePrice: data.purchasePrice || null,
      description: data.description || null,
    })
    .returning();

  return property;
}

export async function updateProperty(
  organizationId: string,
  id: string,
  data: UpdatePropertyInput
): Promise<Property> {
  // Verify property belongs to organization
  const existing = await getPropertyById(organizationId, id);
  if (!existing) {
    throw new Error("Property not found");
  }

  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1;
  if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2 || null;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.yearBuilt !== undefined)
    updateData.yearBuilt = data.yearBuilt ? Number(data.yearBuilt) : null;
  if (data.totalSqft !== undefined)
    updateData.totalSqft = data.totalSqft || null;
  if (data.purchasePrice !== undefined)
    updateData.purchasePrice =
      data.purchasePrice && data.purchasePrice !== "" ? data.purchasePrice : null;
  if (data.description !== undefined) updateData.description = data.description || null;

  const [property] = await db
    .update(properties)
    .set(updateData)
    .where(and(eq(properties.id, id), eq(properties.organizationId, organizationId)))
    .returning();

  return property;
}

export async function deleteProperty(
  organizationId: string,
  id: string
): Promise<void> {
  const existing = await getPropertyById(organizationId, id);
  if (!existing) {
    throw new Error("Property not found");
  }

  await db
    .delete(properties)
    .where(and(eq(properties.id, id), eq(properties.organizationId, organizationId)));
}
