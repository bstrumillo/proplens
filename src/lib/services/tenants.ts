import { eq, and, or, ilike, sql, count, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import type { Tenant } from "@/types";
import type { ListParams, PaginatedResult } from "./types";
import { normalizeListParams } from "./types";
import type { CreateTenantInput, UpdateTenantInput } from "@/lib/validators/tenants";

const SORTABLE_COLUMNS = {
  lastName: tenants.lastName,
  email: tenants.email,
  createdAt: tenants.createdAt,
} as const;

type SortableColumn = keyof typeof SORTABLE_COLUMNS;

export async function getTenants(
  organizationId: string,
  params: ListParams
): Promise<PaginatedResult<Tenant>> {
  const { page, limit, search, sortBy, sortOrder } = normalizeListParams(params);
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [eq(tenants.organizationId, organizationId)];

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(
        ilike(tenants.firstName, searchPattern),
        ilike(tenants.lastName, searchPattern),
        ilike(tenants.email, searchPattern)
      )!
    );
  }

  const whereClause = and(...conditions);

  // Build sort
  const sortColumn = SORTABLE_COLUMNS[sortBy as SortableColumn] ?? tenants.createdAt;
  const orderDirection = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // Execute queries in parallel
  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(tenants)
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(tenants)
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

export async function getTenantById(
  organizationId: string,
  id: string
): Promise<Tenant | null> {
  const result = await db
    .select()
    .from(tenants)
    .where(and(eq(tenants.id, id), eq(tenants.organizationId, organizationId)))
    .limit(1);

  return result[0] ?? null;
}

export async function createTenant(
  organizationId: string,
  data: CreateTenantInput
): Promise<Tenant> {
  const [tenant] = await db
    .insert(tenants)
    .values({
      organizationId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone || null,
      dateOfBirth: data.dateOfBirth || null,
      emergencyName: data.emergencyName || null,
      emergencyPhone: data.emergencyPhone || null,
      emergencyRelation: data.emergencyRelation || null,
      employer: data.employer || null,
      notes: data.notes || null,
    })
    .returning();

  return tenant;
}

export async function updateTenant(
  organizationId: string,
  id: string,
  data: UpdateTenantInput
): Promise<Tenant> {
  // Build the update values, converting empty strings to null
  const updateValues: Record<string, unknown> = {};
  if (data.firstName !== undefined) updateValues.firstName = data.firstName;
  if (data.lastName !== undefined) updateValues.lastName = data.lastName;
  if (data.email !== undefined) updateValues.email = data.email;
  if (data.phone !== undefined) updateValues.phone = data.phone || null;
  if (data.dateOfBirth !== undefined) updateValues.dateOfBirth = data.dateOfBirth || null;
  if (data.emergencyName !== undefined) updateValues.emergencyName = data.emergencyName || null;
  if (data.emergencyPhone !== undefined) updateValues.emergencyPhone = data.emergencyPhone || null;
  if (data.emergencyRelation !== undefined) updateValues.emergencyRelation = data.emergencyRelation || null;
  if (data.employer !== undefined) updateValues.employer = data.employer || null;
  if (data.notes !== undefined) updateValues.notes = data.notes || null;

  const [tenant] = await db
    .update(tenants)
    .set(updateValues)
    .where(and(eq(tenants.id, id), eq(tenants.organizationId, organizationId)))
    .returning();

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
}

export async function deleteTenant(
  organizationId: string,
  id: string
): Promise<void> {
  const result = await db
    .delete(tenants)
    .where(and(eq(tenants.id, id), eq(tenants.organizationId, organizationId)))
    .returning({ id: tenants.id });

  if (result.length === 0) {
    throw new Error("Tenant not found");
  }
}
