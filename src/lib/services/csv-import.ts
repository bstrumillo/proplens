import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { units, tenants, leases, payments } from "@/lib/db/schema";
import type { ParsedReport, RentRollRow, ReceiptRow } from "@/lib/parsers";

export interface ImportResult {
  reportType: string;
  rowCount: number;
  created: { units: number; tenants: number; leases: number; payments: number };
  updated: { units: number; tenants: number; leases: number };
  skipped: number;
  errors: string[];
}

function emptyResult(reportType: string, rowCount: number): ImportResult {
  return {
    reportType,
    rowCount,
    created: { units: 0, tenants: 0, leases: 0, payments: 0 },
    updated: { units: 0, tenants: 0, leases: 0 },
    skipped: 0,
    errors: [],
  };
}

// Valid enum values for payment method
const VALID_PAYMENT_METHODS = [
  "ach",
  "credit_card",
  "debit_card",
  "check",
  "cash",
  "wire",
  "other",
] as const;

type PaymentMethod = (typeof VALID_PAYMENT_METHODS)[number];

function toPaymentMethod(method: string): PaymentMethod {
  const normalized = method.toLowerCase().trim();
  if (VALID_PAYMENT_METHODS.includes(normalized as PaymentMethod)) {
    return normalized as PaymentMethod;
  }
  return "other";
}

// Valid enum values for unit status
const VALID_UNIT_STATUSES = [
  "vacant",
  "occupied",
  "maintenance",
  "reserved",
  "not_rentable",
] as const;

type UnitStatus = (typeof VALID_UNIT_STATUSES)[number];

function toUnitStatus(status: string): UnitStatus | null {
  const normalized = status.toLowerCase().trim();
  if (VALID_UNIT_STATUSES.includes(normalized as UnitStatus)) {
    return normalized as UnitStatus;
  }
  return null;
}

/**
 * Import parsed CSV data into domain tables.
 * Dispatches to the appropriate handler based on parsed.type.
 */
export async function importParsedData(
  organizationId: string,
  parsed: ParsedReport
): Promise<ImportResult> {
  switch (parsed.type) {
    case "rent_roll":
      return importRentRoll(organizationId, parsed.data, parsed.rowCount);
    case "receipts":
      return importReceipts(organizationId, parsed.data, parsed.rowCount);
    case "occupancy":
      // Occupancy is summary/snapshot data — the dashboard computes live
      // occupancy from unit status, so we just acknowledge the import.
      return emptyResult("occupancy", parsed.rowCount);
    case "unknown":
      return {
        ...emptyResult("unknown", 0),
        errors: ["Unrecognized report format — no data imported."],
      };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Rent Roll Import
// ────────────────────────────────────────────────────────────────────────────

async function importRentRoll(
  organizationId: string,
  rows: RentRollRow[],
  rowCount: number
): Promise<ImportResult> {
  const result = emptyResult("rent_roll", rowCount);

  // 1. Load all units for this org → Map<unitNumber, unit>
  const orgUnits = await db
    .select()
    .from(units)
    .where(eq(units.organizationId, organizationId));

  const unitMap = new Map<string, (typeof orgUnits)[number]>();
  for (const u of orgUnits) {
    unitMap.set(u.unitNumber, u);
  }

  // 2. Load all tenants for this org → Map<"first_last", tenant>
  const orgTenants = await db
    .select()
    .from(tenants)
    .where(eq(tenants.organizationId, organizationId));

  const tenantMap = new Map<string, (typeof orgTenants)[number]>();
  for (const t of orgTenants) {
    const key = `${t.firstName.toLowerCase()}_${t.lastName.toLowerCase()}`;
    tenantMap.set(key, t);
  }

  // 3. Load all active leases for this org → Map<unitId, lease>
  const orgLeases = await db
    .select()
    .from(leases)
    .where(
      and(eq(leases.organizationId, organizationId), eq(leases.status, "active"))
    );

  const leaseByUnit = new Map<string, (typeof orgLeases)[number]>();
  for (const l of orgLeases) {
    leaseByUnit.set(l.unitId, l);
  }

  // 4. Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Find unit by unitNumber
      const unit = unitMap.get(row.unitNumber);
      if (!unit) {
        result.skipped++;
        result.errors.push(
          `Row ${i + 1}: Unit "${row.unitNumber}" not found — skipped.`
        );
        continue;
      }

      let tenantId: string | null = null;
      let leaseId: string | null = null;

      // Handle tenant (if name info exists)
      const hasFirstName = row.tenantFirstName && row.tenantFirstName.trim() !== "";
      const hasLastName = row.tenantLastName && row.tenantLastName.trim() !== "";

      if (hasFirstName || hasLastName) {
        const firstName = (row.tenantFirstName ?? "").trim();
        const lastName = (row.tenantLastName ?? "").trim();
        const tenantKey = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;

        let tenant = tenantMap.get(tenantKey);

        if (!tenant) {
          // Create new tenant with generated email
          const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@imported.proplens`;
          const [newTenant] = await db
            .insert(tenants)
            .values({
              organizationId,
              firstName: firstName || "Unknown",
              lastName: lastName || "Unknown",
              email,
            })
            .returning();

          tenant = newTenant;
          tenantMap.set(tenantKey, tenant);
          result.created.tenants++;
        }

        tenantId = tenant.id;

        // Handle lease (if date info exists)
        const hasLeaseStart = row.leaseStart !== null && row.leaseStart !== "";

        if (hasLeaseStart) {
          const existingLease = leaseByUnit.get(unit.id);

          if (existingLease) {
            // Update monthly rent if changed
            const newRent = row.monthlyRent > 0 ? String(row.monthlyRent) : null;
            if (
              newRent &&
              existingLease.monthlyRent !== newRent
            ) {
              await db
                .update(leases)
                .set({ monthlyRent: newRent })
                .where(eq(leases.id, existingLease.id));
              result.updated.leases++;
            }
            leaseId = existingLease.id;
          } else {
            // Create new lease
            const monthlyRent =
              row.monthlyRent > 0 ? String(row.monthlyRent) : "0";
            const securityDeposit =
              row.deposit > 0 ? String(row.deposit) : null;

            const [newLease] = await db
              .insert(leases)
              .values({
                organizationId,
                unitId: unit.id,
                tenantId: tenant.id,
                type: "fixed",
                status: "active",
                startDate: row.leaseStart!,
                endDate: row.leaseEnd ?? undefined,
                monthlyRent,
                securityDeposit,
                rentDueDay: 1,
              })
              .returning();

            leaseId = newLease.id;
            leaseByUnit.set(unit.id, newLease);
            result.created.leases++;
          }
        }
      }

      // Update unit fields
      const updateData: Record<string, unknown> = {};

      if (row.monthlyRent > 0) {
        updateData.currentRent = String(row.monthlyRent);
      }

      // Map status
      if (row.status) {
        const mappedStatus = toUnitStatus(row.status);
        if (mappedStatus) {
          updateData.status = mappedStatus;
        }
      }

      if (tenantId) {
        updateData.currentTenantId = tenantId;
      }
      if (leaseId) {
        updateData.currentLeaseId = leaseId;
      }

      if (Object.keys(updateData).length > 0) {
        await db
          .update(units)
          .set(updateData)
          .where(eq(units.id, unit.id));
        result.updated.units++;
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      result.errors.push(`Row ${i + 1} (unit "${row.unitNumber}"): ${message}`);
      result.skipped++;
    }
  }

  return result;
}

// ────────────────────────────────────────────────────────────────────────────
// Receipts Import
// ────────────────────────────────────────────────────────────────────────────

async function importReceipts(
  organizationId: string,
  rows: ReceiptRow[],
  rowCount: number
): Promise<ImportResult> {
  const result = emptyResult("receipts", rowCount);

  // 1. Load all units for this org → Map<unitNumber, unit>
  const orgUnits = await db
    .select()
    .from(units)
    .where(eq(units.organizationId, organizationId));

  const unitMap = new Map<string, (typeof orgUnits)[number]>();
  for (const u of orgUnits) {
    unitMap.set(u.unitNumber, u);
  }

  // 2. Load all active leases with their tenantId → Map<unitId, lease>
  const orgLeases = await db
    .select()
    .from(leases)
    .where(
      and(eq(leases.organizationId, organizationId), eq(leases.status, "active"))
    );

  const leaseByUnit = new Map<string, (typeof orgLeases)[number]>();
  for (const l of orgLeases) {
    leaseByUnit.set(l.unitId, l);
  }

  // 3. Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Find unit by unitNumber
      if (!row.unitNumber) {
        result.skipped++;
        result.errors.push(
          `Row ${i + 1}: No unit number provided — skipped.`
        );
        continue;
      }

      const unit = unitMap.get(row.unitNumber);
      if (!unit) {
        result.skipped++;
        result.errors.push(
          `Row ${i + 1}: Unit "${row.unitNumber}" not found — skipped.`
        );
        continue;
      }

      // Find active lease for this unit
      const lease = leaseByUnit.get(unit.id);
      if (!lease) {
        result.skipped++;
        result.errors.push(
          `Row ${i + 1}: No active lease for unit "${row.unitNumber}" — skipped.`
        );
        continue;
      }

      // Parse paidAt timestamp
      let paidAt: Date | null = null;
      if (row.date) {
        const parsed = new Date(row.date);
        if (!isNaN(parsed.getTime())) {
          paidAt = parsed;
        }
      }

      // Insert payment
      await db.insert(payments).values({
        organizationId,
        leaseId: lease.id,
        tenantId: lease.tenantId,
        amount: String(row.amount),
        method: toPaymentMethod(row.method),
        type: "rent",
        status: "completed",
        paidAt: paidAt ?? new Date(),
        description: row.description || null,
      });

      result.created.payments++;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error";
      result.errors.push(
        `Row ${i + 1} (unit "${row.unitNumber}"): ${message}`
      );
      result.skipped++;
    }
  }

  return result;
}
