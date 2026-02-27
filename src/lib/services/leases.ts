import { eq, and, or, ilike, sql, count, desc, asc, lte, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { leases, tenants, units, buildings } from "@/lib/db/schema";
import type { Lease } from "@/types";
import type { ListParams, PaginatedResult } from "./types";
import { normalizeListParams } from "./types";
import type { CreateLeaseInput, UpdateLeaseInput } from "@/lib/validators/leases";

// ── Types ────────────────────────────────────────────────────────────

export type LeaseWithDetails = Lease & {
  tenantName: string;
  tenantFirstName: string;
  tenantLastName: string;
  unitNumber: string;
  buildingName: string;
};

// ── Sortable columns ─────────────────────────────────────────────────

const SORTABLE_COLUMNS = {
  startDate: leases.startDate,
  endDate: leases.endDate,
  monthlyRent: leases.monthlyRent,
  status: leases.status,
  createdAt: leases.createdAt,
} as const;

type SortableColumn = keyof typeof SORTABLE_COLUMNS;

// ── List leases ──────────────────────────────────────────────────────

export async function getLeases(
  organizationId: string,
  params: ListParams
): Promise<PaginatedResult<LeaseWithDetails>> {
  const { page, limit, search, sortBy, sortOrder, filters } =
    normalizeListParams(params);
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [eq(leases.organizationId, organizationId)];

  // Filter by status
  if (filters?.status && typeof filters.status === "string") {
    conditions.push(eq(leases.status, filters.status as Lease["status"]));
  }

  // Filter by type
  if (filters?.type && typeof filters.type === "string") {
    conditions.push(eq(leases.type, filters.type as Lease["type"]));
  }

  // Search by tenant name or unit number
  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(
      or(
        ilike(tenants.firstName, searchPattern),
        ilike(tenants.lastName, searchPattern),
        ilike(units.unitNumber, searchPattern),
        ilike(
          sql`${tenants.firstName} || ' ' || ${tenants.lastName}`,
          searchPattern
        )
      )!
    );
  }

  const whereClause = and(...conditions);

  // Build sort
  const sortColumn =
    SORTABLE_COLUMNS[sortBy as SortableColumn] ?? leases.createdAt;
  const orderDirection = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // Execute queries in parallel
  const baseQuery = db
    .select({
      // Lease fields
      id: leases.id,
      organizationId: leases.organizationId,
      unitId: leases.unitId,
      tenantId: leases.tenantId,
      status: leases.status,
      type: leases.type,
      startDate: leases.startDate,
      endDate: leases.endDate,
      monthlyRent: leases.monthlyRent,
      securityDeposit: leases.securityDeposit,
      petDeposit: leases.petDeposit,
      furnishedPremium: leases.furnishedPremium,
      rentDueDay: leases.rentDueDay,
      lateFeeAmount: leases.lateFeeAmount,
      lateFeeGraceDays: leases.lateFeeGraceDays,
      autoRenew: leases.autoRenew,
      renewalTerms: leases.renewalTerms,
      previousLeaseId: leases.previousLeaseId,
      notes: leases.notes,
      metadata: leases.metadata,
      signedByTenant: leases.signedByTenant,
      signedByManager: leases.signedByManager,
      createdAt: leases.createdAt,
      updatedAt: leases.updatedAt,
      // Joined fields
      tenantFirstName: tenants.firstName,
      tenantLastName: tenants.lastName,
      tenantName: sql<string>`${tenants.firstName} || ' ' || ${tenants.lastName}`,
      unitNumber: units.unitNumber,
      buildingName: buildings.name,
    })
    .from(leases)
    .innerJoin(tenants, eq(leases.tenantId, tenants.id))
    .innerJoin(units, eq(leases.unitId, units.id))
    .innerJoin(buildings, eq(units.buildingId, buildings.id));

  const [data, totalResult] = await Promise.all([
    baseQuery
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(leases)
      .innerJoin(tenants, eq(leases.tenantId, tenants.id))
      .innerJoin(units, eq(leases.unitId, units.id))
      .innerJoin(buildings, eq(units.buildingId, buildings.id))
      .where(whereClause),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return {
    data: data as LeaseWithDetails[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

// ── Get lease by ID ──────────────────────────────────────────────────

export async function getLeaseById(
  organizationId: string,
  id: string
): Promise<LeaseWithDetails | null> {
  const result = await db
    .select({
      id: leases.id,
      organizationId: leases.organizationId,
      unitId: leases.unitId,
      tenantId: leases.tenantId,
      status: leases.status,
      type: leases.type,
      startDate: leases.startDate,
      endDate: leases.endDate,
      monthlyRent: leases.monthlyRent,
      securityDeposit: leases.securityDeposit,
      petDeposit: leases.petDeposit,
      furnishedPremium: leases.furnishedPremium,
      rentDueDay: leases.rentDueDay,
      lateFeeAmount: leases.lateFeeAmount,
      lateFeeGraceDays: leases.lateFeeGraceDays,
      autoRenew: leases.autoRenew,
      renewalTerms: leases.renewalTerms,
      previousLeaseId: leases.previousLeaseId,
      notes: leases.notes,
      metadata: leases.metadata,
      signedByTenant: leases.signedByTenant,
      signedByManager: leases.signedByManager,
      createdAt: leases.createdAt,
      updatedAt: leases.updatedAt,
      tenantFirstName: tenants.firstName,
      tenantLastName: tenants.lastName,
      tenantName: sql<string>`${tenants.firstName} || ' ' || ${tenants.lastName}`,
      unitNumber: units.unitNumber,
      buildingName: buildings.name,
    })
    .from(leases)
    .innerJoin(tenants, eq(leases.tenantId, tenants.id))
    .innerJoin(units, eq(leases.unitId, units.id))
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(
      and(eq(leases.id, id), eq(leases.organizationId, organizationId))
    )
    .limit(1);

  return (result[0] as LeaseWithDetails) ?? null;
}

// ── Create lease ─────────────────────────────────────────────────────

export async function createLease(
  organizationId: string,
  data: CreateLeaseInput
): Promise<Lease> {
  const [lease] = await db
    .insert(leases)
    .values({
      organizationId,
      unitId: data.unitId,
      tenantId: data.tenantId,
      type: data.type,
      startDate: data.startDate,
      endDate: data.endDate || null,
      monthlyRent: data.monthlyRent,
      securityDeposit: data.securityDeposit || null,
      petDeposit: data.petDeposit || null,
      furnishedPremium: data.furnishedPremium || null,
      rentDueDay: data.rentDueDay,
      lateFeeAmount: data.lateFeeAmount || null,
      lateFeeGraceDays: data.lateFeeGraceDays,
      autoRenew: data.autoRenew,
      notes: data.notes || null,
    })
    .returning();

  return lease;
}

// ── Update lease ─────────────────────────────────────────────────────

export async function updateLease(
  organizationId: string,
  id: string,
  data: UpdateLeaseInput
): Promise<Lease> {
  // Fetch existing lease
  const existing = await db
    .select()
    .from(leases)
    .where(
      and(eq(leases.id, id), eq(leases.organizationId, organizationId))
    )
    .limit(1);

  if (!existing[0]) {
    throw new Error("Lease not found");
  }

  const oldLease = existing[0];

  // Build update data
  const updateData: Record<string, unknown> = {};

  if (data.unitId !== undefined) updateData.unitId = data.unitId;
  if (data.tenantId !== undefined) updateData.tenantId = data.tenantId;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.startDate !== undefined) updateData.startDate = data.startDate;
  if (data.endDate !== undefined) updateData.endDate = data.endDate || null;
  if (data.monthlyRent !== undefined) updateData.monthlyRent = data.monthlyRent;
  if (data.securityDeposit !== undefined)
    updateData.securityDeposit = data.securityDeposit || null;
  if (data.petDeposit !== undefined)
    updateData.petDeposit = data.petDeposit || null;
  if (data.furnishedPremium !== undefined)
    updateData.furnishedPremium = data.furnishedPremium || null;
  if (data.rentDueDay !== undefined) updateData.rentDueDay = data.rentDueDay;
  if (data.lateFeeAmount !== undefined)
    updateData.lateFeeAmount = data.lateFeeAmount || null;
  if (data.lateFeeGraceDays !== undefined)
    updateData.lateFeeGraceDays = data.lateFeeGraceDays;
  if (data.autoRenew !== undefined) updateData.autoRenew = data.autoRenew;
  if (data.notes !== undefined) updateData.notes = data.notes || null;

  const [lease] = await db
    .update(leases)
    .set(updateData)
    .where(
      and(eq(leases.id, id), eq(leases.organizationId, organizationId))
    )
    .returning();

  if (!lease) {
    throw new Error("Lease not found");
  }

  // Handle lease-unit sync on status transitions
  const newStatus = data.status;
  const oldStatus = oldLease.status;

  if (newStatus && newStatus !== oldStatus) {
    // Activating a lease: mark unit as occupied
    if (newStatus === "active") {
      await db
        .update(units)
        .set({
          currentTenantId: lease.tenantId,
          currentLeaseId: lease.id,
          status: "occupied",
        })
        .where(eq(units.id, lease.unitId));
    }

    // Terminating or expiring a lease: clear unit
    if (newStatus === "terminated" || newStatus === "expired") {
      await db
        .update(units)
        .set({
          currentTenantId: null,
          currentLeaseId: null,
          status: "vacant",
        })
        .where(eq(units.id, lease.unitId));
    }
  }

  return lease;
}

// ── Delete lease ─────────────────────────────────────────────────────

export async function deleteLease(
  organizationId: string,
  id: string
): Promise<void> {
  const result = await db
    .delete(leases)
    .where(
      and(eq(leases.id, id), eq(leases.organizationId, organizationId))
    )
    .returning({ id: leases.id });

  if (result.length === 0) {
    throw new Error("Lease not found");
  }
}

// ── Expiring leases ──────────────────────────────────────────────────

export async function getExpiringLeases(
  organizationId: string,
  daysWindow: number
): Promise<LeaseWithDetails[]> {
  const today = new Date().toISOString().split("T")[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysWindow);
  const futureDateStr = futureDate.toISOString().split("T")[0];

  const result = await db
    .select({
      id: leases.id,
      organizationId: leases.organizationId,
      unitId: leases.unitId,
      tenantId: leases.tenantId,
      status: leases.status,
      type: leases.type,
      startDate: leases.startDate,
      endDate: leases.endDate,
      monthlyRent: leases.monthlyRent,
      securityDeposit: leases.securityDeposit,
      petDeposit: leases.petDeposit,
      furnishedPremium: leases.furnishedPremium,
      rentDueDay: leases.rentDueDay,
      lateFeeAmount: leases.lateFeeAmount,
      lateFeeGraceDays: leases.lateFeeGraceDays,
      autoRenew: leases.autoRenew,
      renewalTerms: leases.renewalTerms,
      previousLeaseId: leases.previousLeaseId,
      notes: leases.notes,
      metadata: leases.metadata,
      signedByTenant: leases.signedByTenant,
      signedByManager: leases.signedByManager,
      createdAt: leases.createdAt,
      updatedAt: leases.updatedAt,
      tenantFirstName: tenants.firstName,
      tenantLastName: tenants.lastName,
      tenantName: sql<string>`${tenants.firstName} || ' ' || ${tenants.lastName}`,
      unitNumber: units.unitNumber,
      buildingName: buildings.name,
    })
    .from(leases)
    .innerJoin(tenants, eq(leases.tenantId, tenants.id))
    .innerJoin(units, eq(leases.unitId, units.id))
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(
      and(
        eq(leases.organizationId, organizationId),
        eq(leases.status, "active"),
        gte(leases.endDate, today),
        lte(leases.endDate, futureDateStr)
      )
    )
    .orderBy(asc(leases.endDate));

  return result as LeaseWithDetails[];
}

// ── Helper: get units for dropdown ───────────────────────────────────

export type UnitOption = {
  id: string;
  unitNumber: string;
  buildingName: string;
};

export async function getUnitsForDropdown(
  organizationId: string
): Promise<UnitOption[]> {
  const result = await db
    .select({
      id: units.id,
      unitNumber: units.unitNumber,
      buildingName: buildings.name,
    })
    .from(units)
    .innerJoin(buildings, eq(units.buildingId, buildings.id))
    .where(eq(units.organizationId, organizationId))
    .orderBy(asc(buildings.name), asc(units.unitNumber));

  return result;
}

// ── Helper: get tenants for dropdown ─────────────────────────────────

export type TenantOption = {
  id: string;
  firstName: string;
  lastName: string;
};

export async function getTenantsForDropdown(
  organizationId: string
): Promise<TenantOption[]> {
  const result = await db
    .select({
      id: tenants.id,
      firstName: tenants.firstName,
      lastName: tenants.lastName,
    })
    .from(tenants)
    .where(eq(tenants.organizationId, organizationId))
    .orderBy(asc(tenants.lastName), asc(tenants.firstName));

  return result;
}
