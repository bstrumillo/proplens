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

// ────────────────────────────────────────────────────────────────────────────
// Unit matching helpers
// ────────────────────────────────────────────────────────────────────────────

type UnitRecord = typeof units.$inferSelect;

/**
 * Normalize a unit number from AppFolio by stripping trailing descriptions
 * and sub-unit suffixes.
 * Examples:
 *   "652-H Furnished, walk in ready..." → "652-H"
 *   "636-F - 1" → "636-F"
 *   "652-D - d" → "652-D"
 */
function normalizeUnitNumber(raw: string): string {
  let unit = raw.trim();
  // Strip trailing descriptions: "652-H Furnished, walk in ready..." → "652-H"
  unit = unit.replace(/\s+(Furnished|Room|Storage|Garage|Parking|Premium).*$/i, "");
  // Strip sub-unit suffix: "636-F - 1" → "636-F", "652-D - d" → "652-D"
  unit = unit.replace(/\s+-\s+\w+$/, "");
  return unit;
}

/**
 * Try multiple matching strategies to find a unit in the map.
 */
function findUnit(
  unitNumber: string,
  unitMap: Map<string, UnitRecord>
): UnitRecord | undefined {
  // Exact match
  let unit = unitMap.get(unitNumber);
  if (unit) return unit;

  // Normalized match
  const normalized = normalizeUnitNumber(unitNumber);
  if (normalized !== unitNumber) {
    unit = unitMap.get(normalized);
    if (unit) return unit;
  }

  return undefined;
}

/**
 * Auto-create a unit in the DB when the building prefix matches an existing unit.
 * Extracts the building prefix (e.g., "636" from "636-G") and finds an existing
 * unit with the same prefix to determine the buildingId.
 */
async function autoCreateUnit(
  organizationId: string,
  unitNumber: string,
  unitMap: Map<string, UnitRecord>,
  result: ImportResult
): Promise<UnitRecord | undefined> {
  // Normalize first so we create the unit with the clean name
  const cleanUnit = normalizeUnitNumber(unitNumber);

  // Extract building prefix: "636-G" → "636", "652-H" → "652"
  const prefixMatch = cleanUnit.match(/^(\d+)/);
  if (!prefixMatch) return undefined;

  const prefix = prefixMatch[1];

  // Find any existing unit with the same building prefix to get buildingId
  let buildingId: string | undefined;
  for (const [existingUnitNumber, existingUnit] of unitMap.entries()) {
    if (existingUnitNumber.startsWith(prefix)) {
      buildingId = existingUnit.buildingId;
      break;
    }
  }

  if (!buildingId) return undefined;

  try {
    const [newUnit] = await db
      .insert(units)
      .values({
        organizationId,
        buildingId,
        unitNumber: cleanUnit,
        type: "apartment",
        status: "occupied", // It appears in a financial report, so it's occupied
      })
      .returning();

    // Add to the map so subsequent rows can find it
    unitMap.set(cleanUnit, newUnit);
    result.created.units++;

    return newUnit;
  } catch {
    // Unit might already exist (race condition or duplicate) — try to fetch it
    const existing = await db
      .select()
      .from(units)
      .where(
        and(
          eq(units.organizationId, organizationId),
          eq(units.unitNumber, cleanUnit)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      unitMap.set(cleanUnit, existing[0]);
      return existing[0];
    }

    return undefined;
  }
}

/**
 * Resolve a unit by trying findUnit first, then autoCreateUnit as fallback.
 */
async function resolveUnit(
  organizationId: string,
  unitNumber: string,
  unitMap: Map<string, UnitRecord>,
  result: ImportResult
): Promise<UnitRecord | undefined> {
  const found = findUnit(unitNumber, unitMap);
  if (found) return found;

  return autoCreateUnit(organizationId, unitNumber, unitMap, result);
}

/**
 * Map a receipt category to a payment type string for the payments table.
 */
function categoryToPaymentType(category: ReceiptRow["category"]): string {
  switch (category) {
    case "rent": return "rent";
    case "fee": return "fee";
    case "insurance": return "insurance";
    case "cam": return "cam";
    case "security_deposit": return "security_deposit";
    case "prepayment": return "prepayment";
    case "other": return "other";
    default: return "rent";
  }
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

  const unitMap = new Map<string, UnitRecord>();
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
      // Find unit by unitNumber (with normalization + auto-create fallback)
      const unit = await resolveUnit(organizationId, row.unitNumber, unitMap, result);
      if (!unit) {
        result.skipped++;
        result.errors.push(
          `Row ${i + 1}: Unit "${row.unitNumber}" not found and could not be auto-created — skipped.`
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

  const unitMap = new Map<string, UnitRecord>();
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

      // Use findUnit with normalization + auto-create fallback
      const unit = await resolveUnit(organizationId, row.unitNumber, unitMap, result);
      if (!unit) {
        result.skipped++;
        result.errors.push(
          `Row ${i + 1}: Unit "${row.unitNumber}" not found and could not be auto-created — skipped.`
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

      // Insert payment with category-based type
      await db.insert(payments).values({
        organizationId,
        leaseId: lease.id,
        tenantId: lease.tenantId,
        amount: String(row.amount),
        method: toPaymentMethod(row.method),
        type: categoryToPaymentType(row.category),
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
