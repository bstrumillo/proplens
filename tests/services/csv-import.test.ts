import { beforeAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants as tenantsTable } from "@/lib/db/schema";
import { parseCSV } from "@/lib/parsers";
import { importParsedData } from "@/lib/services/csv-import";
import { getLeases, listLeasesByTenant } from "@/lib/services/leases";
import { listPaymentsByTenant } from "@/lib/services/payments";
import {
  resetDb,
  makeOrg,
  makeProperty,
  makeBuilding,
  makeUnit,
} from "../helpers/db";

// Round-trip: AppFolio-style CSV → parser → importParsedData → domain
// tables. The importer is the migration wedge and (today) the only writer
// of payments — pin its behavior.

const RENT_ROLL_CSV = `Unit,First Name,Last Name,Status,Move In,Lease From,Lease To,Rent,Security Deposit
U-101,John,Doe,Current,01/01/2026,01/01/2026,12/31/2026,"$1,500.00","$1,500.00"
U-102,Jane,Smith,Current,02/01/2026,02/01/2026,01/31/2027,"$1,200.00","$1,200.00"
`;

const RECEIPTS_CSV = `Account Name,Payments,Charges,Last Receipt Date
"-> Double Jack Properties, LLC - Unit U-101 - Doe, John",,,
Rent,-1500.00,1500.00,06/01/2026
Total,,,
`;

let orgId: string;

beforeAll(async () => {
  await resetDb();
  const org = await makeOrg();
  orgId = org.id;
  const property = await makeProperty(orgId);
  const building = await makeBuilding(orgId, property.id);
  await makeUnit(orgId, building.id, { unitNumber: "U-101" });
  await makeUnit(orgId, building.id, { unitNumber: "U-102" });
});

describe("rent roll import", () => {
  it("detects the report type and creates tenants + active leases", async () => {
    const parsed = parseCSV(RENT_ROLL_CSV);
    expect(parsed.type).toBe("rent_roll");
    expect(parsed.rowCount).toBe(2);

    const result = await importParsedData(orgId, parsed);
    expect(result.errors).toEqual([]);

    const orgTenants = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.organizationId, orgId));
    const names = orgTenants
      .map((t) => `${t.firstName} ${t.lastName}`)
      .sort();
    expect(names).toEqual(["Jane Smith", "John Doe"]);

    const leaseResult = await getLeases(orgId, { page: 1, limit: 10 });
    expect(leaseResult.total).toBe(2);
    const byUnit = Object.fromEntries(
      leaseResult.data.map((l) => [l.unitNumber, l])
    );
    expect(byUnit["U-101"].status).toBe("active");
    expect(Number(byUnit["U-101"].monthlyRent)).toBe(1500);
    expect(Number(byUnit["U-102"].monthlyRent)).toBe(1200);
  });

  it("is idempotent enough not to duplicate tenants on re-import", async () => {
    const parsed = parseCSV(RENT_ROLL_CSV);
    await importParsedData(orgId, parsed);

    const orgTenants = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.organizationId, orgId));
    expect(orgTenants).toHaveLength(2);
  });
});

describe("receipts import (AppFolio Resident Financial Activity)", () => {
  it("creates a completed rent payment for the leased unit", async () => {
    const parsed = parseCSV(RECEIPTS_CSV);
    expect(parsed.type).toBe("receipts");

    const result = await importParsedData(orgId, parsed);
    expect(result.errors).toEqual([]);

    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.lastName, "Doe"));
    expect(tenant).toBeTruthy();

    const paymentsForTenant = await listPaymentsByTenant(orgId, tenant.id);
    expect(paymentsForTenant).toHaveLength(1);
    expect(paymentsForTenant[0].status).toBe("completed");
    expect(Number(paymentsForTenant[0].amount)).toBe(1500);
    expect(paymentsForTenant[0].type).toBe("rent");
    expect(paymentsForTenant[0].unitNumber).toBe("U-101");
  });

  it("skips payments for units without an active lease", async () => {
    const csv = `Account Name,Payments,Charges,Last Receipt Date
"-> Double Jack Properties, LLC - Unit U-999 - Nobody, Here",,,
Rent,-900.00,900.00,06/01/2026
`;
    const parsed = parseCSV(csv);
    const result = await importParsedData(orgId, parsed);
    expect(result.created.payments).toBe(0);
  });
});

describe("unknown format", () => {
  it("does not import anything", async () => {
    const parsed = parseCSV("Foo,Bar\n1,2\n");
    expect(parsed.type).toBe("unknown");
    const result = await importParsedData(orgId, parsed);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("tenant lease linkage after import", () => {
  it("lists the imported lease on the tenant", async () => {
    const [tenant] = await db
      .select()
      .from(tenantsTable)
      .where(eq(tenantsTable.lastName, "Smith"));
    const tenantLeases = await listLeasesByTenant(orgId, tenant.id);
    expect(tenantLeases).toHaveLength(1);
    expect(tenantLeases[0].unitNumber).toBe("U-102");
  });
});
