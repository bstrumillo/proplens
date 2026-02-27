import { eq, and, or, ilike, sql, count, desc, asc, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { maintenanceRequests, units, tenants } from "@/lib/db/schema";
import type { MaintenanceRequest } from "@/types";
import type { ListParams, PaginatedResult } from "./types";
import { normalizeListParams } from "./types";
import type {
  CreateMaintenanceRequestInput,
  UpdateMaintenanceRequestInput,
} from "@/lib/validators/maintenance";

// ── Types for joined results ────────────────────────────────────────
export type MaintenanceRequestWithRelations = MaintenanceRequest & {
  unitNumber: string | null;
  tenantName: string | null;
};

// ── Sortable columns ────────────────────────────────────────────────
const SORTABLE_COLUMNS = {
  title: maintenanceRequests.title,
  priority: maintenanceRequests.priority,
  status: maintenanceRequests.status,
  createdAt: maintenanceRequests.createdAt,
} as const;

type SortableColumn = keyof typeof SORTABLE_COLUMNS;

// ── List maintenance requests ───────────────────────────────────────
export async function getMaintenanceRequests(
  organizationId: string,
  params: ListParams
): Promise<PaginatedResult<MaintenanceRequestWithRelations>> {
  const { page, limit, search, sortBy, sortOrder, filters } =
    normalizeListParams(params);
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [eq(maintenanceRequests.organizationId, organizationId)];

  if (search) {
    const searchPattern = `%${search}%`;
    conditions.push(ilike(maintenanceRequests.title, searchPattern));
  }

  if (filters?.status && typeof filters.status === "string") {
    conditions.push(
      eq(maintenanceRequests.status, filters.status as MaintenanceRequest["status"])
    );
  }

  if (filters?.priority && typeof filters.priority === "string") {
    conditions.push(
      eq(maintenanceRequests.priority, filters.priority as MaintenanceRequest["priority"])
    );
  }

  if (filters?.category && typeof filters.category === "string") {
    conditions.push(eq(maintenanceRequests.category, filters.category));
  }

  const whereClause = and(...conditions);

  // Build sort
  const sortColumn =
    SORTABLE_COLUMNS[sortBy as SortableColumn] ?? maintenanceRequests.createdAt;
  const orderDirection = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // Execute queries in parallel
  const [data, totalResult] = await Promise.all([
    db
      .select({
        id: maintenanceRequests.id,
        organizationId: maintenanceRequests.organizationId,
        unitId: maintenanceRequests.unitId,
        tenantId: maintenanceRequests.tenantId,
        title: maintenanceRequests.title,
        description: maintenanceRequests.description,
        category: maintenanceRequests.category,
        status: maintenanceRequests.status,
        priority: maintenanceRequests.priority,
        submittedBy: maintenanceRequests.submittedBy,
        assignedTo: maintenanceRequests.assignedTo,
        resolvedAt: maintenanceRequests.resolvedAt,
        estimatedCost: maintenanceRequests.estimatedCost,
        actualCost: maintenanceRequests.actualCost,
        entryPermission: maintenanceRequests.entryPermission,
        metadata: maintenanceRequests.metadata,
        createdAt: maintenanceRequests.createdAt,
        updatedAt: maintenanceRequests.updatedAt,
        unitNumber: units.unitNumber,
        tenantName:
          sql<string | null>`CASE WHEN ${tenants.firstName} IS NOT NULL THEN ${tenants.firstName} || ' ' || ${tenants.lastName} ELSE NULL END`.as(
            "tenant_name"
          ),
      })
      .from(maintenanceRequests)
      .leftJoin(units, eq(maintenanceRequests.unitId, units.id))
      .leftJoin(tenants, eq(maintenanceRequests.tenantId, tenants.id))
      .where(whereClause)
      .orderBy(orderDirection)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(maintenanceRequests)
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

// ── Get single request by ID ────────────────────────────────────────
export async function getMaintenanceRequestById(
  organizationId: string,
  id: string
): Promise<MaintenanceRequestWithRelations | null> {
  const result = await db
    .select({
      id: maintenanceRequests.id,
      organizationId: maintenanceRequests.organizationId,
      unitId: maintenanceRequests.unitId,
      tenantId: maintenanceRequests.tenantId,
      title: maintenanceRequests.title,
      description: maintenanceRequests.description,
      category: maintenanceRequests.category,
      status: maintenanceRequests.status,
      priority: maintenanceRequests.priority,
      submittedBy: maintenanceRequests.submittedBy,
      assignedTo: maintenanceRequests.assignedTo,
      resolvedAt: maintenanceRequests.resolvedAt,
      estimatedCost: maintenanceRequests.estimatedCost,
      actualCost: maintenanceRequests.actualCost,
      entryPermission: maintenanceRequests.entryPermission,
      metadata: maintenanceRequests.metadata,
      createdAt: maintenanceRequests.createdAt,
      updatedAt: maintenanceRequests.updatedAt,
      unitNumber: units.unitNumber,
      tenantName:
        sql<string | null>`CASE WHEN ${tenants.firstName} IS NOT NULL THEN ${tenants.firstName} || ' ' || ${tenants.lastName} ELSE NULL END`.as(
          "tenant_name"
        ),
    })
    .from(maintenanceRequests)
    .leftJoin(units, eq(maintenanceRequests.unitId, units.id))
    .leftJoin(tenants, eq(maintenanceRequests.tenantId, tenants.id))
    .where(
      and(
        eq(maintenanceRequests.id, id),
        eq(maintenanceRequests.organizationId, organizationId)
      )
    )
    .limit(1);

  return result[0] ?? null;
}

// ── Create request ──────────────────────────────────────────────────
export async function createMaintenanceRequest(
  organizationId: string,
  data: CreateMaintenanceRequestInput
): Promise<MaintenanceRequest> {
  // If priority is emergency, auto-set status to acknowledged
  const status = data.priority === "emergency" ? "acknowledged" : "submitted";

  const [request] = await db
    .insert(maintenanceRequests)
    .values({
      organizationId,
      unitId: data.unitId,
      tenantId: data.tenantId || null,
      title: data.title,
      description: data.description || null,
      category: data.category || null,
      priority: data.priority,
      status,
      estimatedCost: data.estimatedCost || null,
      entryPermission: data.entryPermission === "true",
    })
    .returning();

  return request;
}

// ── Update request ──────────────────────────────────────────────────
export async function updateMaintenanceRequest(
  organizationId: string,
  id: string,
  data: UpdateMaintenanceRequestInput
): Promise<MaintenanceRequest> {
  const updateValues: Record<string, unknown> = {};

  if (data.unitId !== undefined) updateValues.unitId = data.unitId;
  if (data.tenantId !== undefined) updateValues.tenantId = data.tenantId || null;
  if (data.title !== undefined) updateValues.title = data.title;
  if (data.description !== undefined)
    updateValues.description = data.description || null;
  if (data.category !== undefined) updateValues.category = data.category || null;
  if (data.priority !== undefined) updateValues.priority = data.priority;
  if (data.status !== undefined) {
    updateValues.status = data.status;
    // If status changes to completed or closed, set resolvedAt
    if (data.status === "completed" || data.status === "closed") {
      updateValues.resolvedAt = new Date();
    }
  }
  if (data.assignedTo !== undefined)
    updateValues.assignedTo = data.assignedTo || null;
  if (data.estimatedCost !== undefined)
    updateValues.estimatedCost = data.estimatedCost || null;
  if (data.actualCost !== undefined)
    updateValues.actualCost = data.actualCost || null;
  if (data.entryPermission !== undefined)
    updateValues.entryPermission = data.entryPermission === "true";

  const [request] = await db
    .update(maintenanceRequests)
    .set(updateValues)
    .where(
      and(
        eq(maintenanceRequests.id, id),
        eq(maintenanceRequests.organizationId, organizationId)
      )
    )
    .returning();

  if (!request) {
    throw new Error("Maintenance request not found");
  }

  return request;
}

// ── Delete request ──────────────────────────────────────────────────
export async function deleteMaintenanceRequest(
  organizationId: string,
  id: string
): Promise<void> {
  const result = await db
    .delete(maintenanceRequests)
    .where(
      and(
        eq(maintenanceRequests.id, id),
        eq(maintenanceRequests.organizationId, organizationId)
      )
    )
    .returning({ id: maintenanceRequests.id });

  if (result.length === 0) {
    throw new Error("Maintenance request not found");
  }
}

// ── Get open request count ──────────────────────────────────────────
export async function getOpenRequestCount(
  organizationId: string
): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(maintenanceRequests)
    .where(
      and(
        eq(maintenanceRequests.organizationId, organizationId),
        notInArray(maintenanceRequests.status, ["completed", "closed", "cancelled"])
      )
    );

  return result[0]?.count ?? 0;
}

// ── Helper: Get units for select dropdown ───────────────────────────
export async function getUnitsForSelect(
  organizationId: string
): Promise<{ id: string; unitNumber: string }[]> {
  return db
    .select({
      id: units.id,
      unitNumber: units.unitNumber,
    })
    .from(units)
    .where(eq(units.organizationId, organizationId))
    .orderBy(asc(units.unitNumber));
}

// ── Helper: Get tenants for select dropdown ─────────────────────────
export async function getTenantsForSelect(
  organizationId: string
): Promise<{ id: string; name: string }[]> {
  const result = await db
    .select({
      id: tenants.id,
      firstName: tenants.firstName,
      lastName: tenants.lastName,
    })
    .from(tenants)
    .where(eq(tenants.organizationId, organizationId))
    .orderBy(asc(tenants.lastName), asc(tenants.firstName));

  return result.map((t) => ({
    id: t.id,
    name: `${t.firstName} ${t.lastName}`,
  }));
}
