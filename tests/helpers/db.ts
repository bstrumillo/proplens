import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  organizations,
  properties,
  buildings,
  units,
  tenants,
  leases,
  payments,
  maintenanceRequests,
  vendors,
} from "@/lib/db/schema";

// Truncates all domain tables. Test files run sequentially
// (fileParallelism: false), so this is safe to call in beforeAll/beforeEach.
export async function resetDb() {
  await db.execute(sql`
    TRUNCATE TABLE
      organizations,
      "user",
      "session",
      "account",
      "verification"
    RESTART IDENTITY CASCADE
  `);
}

// ── Factories ─────────────────────────────────────────────────────────
// Minimal-required-fields inserts with unique values; override as needed.

export async function makeOrg(overrides: Partial<typeof organizations.$inferInsert> = {}) {
  const suffix = randomUUID().slice(0, 8);
  const [org] = await db
    .insert(organizations)
    .values({
      name: `Test Org ${suffix}`,
      slug: `test-org-${suffix}`,
      ...overrides,
    })
    .returning();
  return org;
}

export async function makeProperty(
  organizationId: string,
  overrides: Partial<typeof properties.$inferInsert> = {}
) {
  const suffix = randomUUID().slice(0, 8);
  const [property] = await db
    .insert(properties)
    .values({
      organizationId,
      name: `Property ${suffix}`,
      addressLine1: `${Math.floor(Math.random() * 9999)} Main St`,
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      type: "residential",
      ...overrides,
    })
    .returning();
  return property;
}

export async function makeBuilding(
  organizationId: string,
  propertyId: string,
  overrides: Partial<typeof buildings.$inferInsert> = {}
) {
  const suffix = randomUUID().slice(0, 8);
  const [building] = await db
    .insert(buildings)
    .values({
      organizationId,
      propertyId,
      name: `Building ${suffix}`,
      ...overrides,
    })
    .returning();
  return building;
}

export async function makeUnit(
  organizationId: string,
  buildingId: string,
  overrides: Partial<typeof units.$inferInsert> = {}
) {
  const suffix = randomUUID().slice(0, 4);
  const [unit] = await db
    .insert(units)
    .values({
      organizationId,
      buildingId,
      unitNumber: `U-${suffix}`,
      type: "apartment",
      ...overrides,
    })
    .returning();
  return unit;
}

export async function makeTenant(
  organizationId: string,
  overrides: Partial<typeof tenants.$inferInsert> = {}
) {
  const suffix = randomUUID().slice(0, 8);
  const [tenant] = await db
    .insert(tenants)
    .values({
      organizationId,
      firstName: "Test",
      lastName: `Tenant-${suffix}`,
      email: `tenant-${suffix}@example.com`,
      ...overrides,
    })
    .returning();
  return tenant;
}

export async function makeLease(
  organizationId: string,
  unitId: string,
  tenantId: string,
  overrides: Partial<typeof leases.$inferInsert> = {}
) {
  const [lease] = await db
    .insert(leases)
    .values({
      organizationId,
      unitId,
      tenantId,
      type: "fixed",
      status: "active",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      monthlyRent: "1500.00",
      ...overrides,
    })
    .returning();
  return lease;
}

export async function makePayment(
  organizationId: string,
  leaseId: string,
  tenantId: string,
  overrides: Partial<typeof payments.$inferInsert> = {}
) {
  const [payment] = await db
    .insert(payments)
    .values({
      organizationId,
      leaseId,
      tenantId,
      amount: "1500.00",
      status: "completed",
      type: "rent",
      paidAt: new Date("2026-06-01T12:00:00Z"),
      ...overrides,
    })
    .returning();
  return payment;
}

export async function makeMaintenanceRequest(
  organizationId: string,
  unitId: string,
  overrides: Partial<typeof maintenanceRequests.$inferInsert> = {}
) {
  const suffix = randomUUID().slice(0, 8);
  const [request] = await db
    .insert(maintenanceRequests)
    .values({
      organizationId,
      unitId,
      title: `Fix ${suffix}`,
      ...overrides,
    })
    .returning();
  return request;
}

export async function makeVendor(
  organizationId: string,
  overrides: Partial<typeof vendors.$inferInsert> = {}
) {
  const suffix = randomUUID().slice(0, 8);
  const [vendor] = await db
    .insert(vendors)
    .values({
      organizationId,
      name: `Vendor ${suffix}`,
      ...overrides,
    })
    .returning();
  return vendor;
}

// A fully-populated org: property → building → unit → tenant → active lease.
export async function makeOrgWithLease() {
  const org = await makeOrg();
  const property = await makeProperty(org.id);
  const building = await makeBuilding(org.id, property.id);
  const unit = await makeUnit(org.id, building.id);
  const tenant = await makeTenant(org.id);
  const lease = await makeLease(org.id, unit.id, tenant.id);
  return { org, property, building, unit, tenant, lease };
}
