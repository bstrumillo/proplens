import { eq, and, or, ilike, count, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { vendors } from "@/lib/db/schema";
import type { Vendor } from "@/types";
import type { ListParams, PaginatedResult } from "./types";
import { normalizeListParams } from "./types";
import type { CreateVendorInput, UpdateVendorInput } from "@/lib/validators/vendors";

const SORTABLE_COLUMNS = {
  name: vendors.name,
  companyName: vendors.companyName,
  email: vendors.email,
  createdAt: vendors.createdAt,
} as const;

type SortableColumn = keyof typeof SORTABLE_COLUMNS;

export async function getVendors(
  organizationId: string,
  params: ListParams
): Promise<PaginatedResult<Vendor>> {
  const { page, limit, search, sortBy, sortOrder } = normalizeListParams(params);
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [eq(vendors.organizationId, organizationId)];

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(
        ilike(vendors.name, searchPattern),
        ilike(vendors.companyName, searchPattern)
      )!
    );
  }

  const whereClause = and(...conditions);

  // Build sort
  const sortColumn = SORTABLE_COLUMNS[sortBy as SortableColumn] ?? vendors.createdAt;
  const orderDirection = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // Execute queries in parallel
  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(vendors)
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(vendors)
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getVendorById(
  organizationId: string,
  id: string
): Promise<Vendor | null> {
  const result = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.id, id), eq(vendors.organizationId, organizationId)))
    .limit(1);

  return result[0] ?? null;
}

function parseSpecialties(specialtiesStr: string | undefined): string[] {
  if (!specialtiesStr) return [];
  return specialtiesStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createVendor(
  organizationId: string,
  data: CreateVendorInput
): Promise<Vendor> {
  const [vendor] = await db
    .insert(vendors)
    .values({
      organizationId,
      name: data.name,
      companyName: data.companyName || null,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      specialties: parseSpecialties(data.specialties),
      licenseNumber: data.licenseNumber || null,
      insuranceExpiry: data.insuranceExpiry || null,
      hourlyRate: data.hourlyRate || null,
      notes: data.notes || null,
    })
    .returning();

  return vendor;
}

export async function updateVendor(
  organizationId: string,
  id: string,
  data: UpdateVendorInput
): Promise<Vendor> {
  // Build the update values, converting empty strings to null
  const updateValues: Record<string, unknown> = {};
  if (data.name !== undefined) updateValues.name = data.name;
  if (data.companyName !== undefined) updateValues.companyName = data.companyName || null;
  if (data.email !== undefined) updateValues.email = data.email || null;
  if (data.phone !== undefined) updateValues.phone = data.phone || null;
  if (data.address !== undefined) updateValues.address = data.address || null;
  if (data.specialties !== undefined) updateValues.specialties = parseSpecialties(data.specialties);
  if (data.licenseNumber !== undefined) updateValues.licenseNumber = data.licenseNumber || null;
  if (data.insuranceExpiry !== undefined) updateValues.insuranceExpiry = data.insuranceExpiry || null;
  if (data.hourlyRate !== undefined) updateValues.hourlyRate = data.hourlyRate || null;
  if (data.notes !== undefined) updateValues.notes = data.notes || null;

  const [vendor] = await db
    .update(vendors)
    .set(updateValues)
    .where(and(eq(vendors.id, id), eq(vendors.organizationId, organizationId)))
    .returning();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  return vendor;
}

export async function deleteVendor(
  organizationId: string,
  id: string
): Promise<void> {
  const result = await db
    .delete(vendors)
    .where(and(eq(vendors.id, id), eq(vendors.organizationId, organizationId)))
    .returning({ id: vendors.id });

  if (result.length === 0) {
    throw new Error("Vendor not found");
  }
}
