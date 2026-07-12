import { beforeAll, describe, expect, it } from "vitest";
import { getDashboardData } from "@/lib/services/dashboard";
import {
  resetDb,
  makeOrg,
  makeProperty,
  makeBuilding,
  makeUnit,
  makeTenant,
  makeLease,
  makeMaintenanceRequest,
} from "../helpers/db";

// Pins the raw-SQL aggregations in src/lib/services/dashboard.ts.
// Only time-independent KPIs are asserted (no "this month" payment KPIs).

let orgId: string;

beforeAll(async () => {
  await resetDb();
  const org = await makeOrg();
  orgId = org.id;
  const property = await makeProperty(orgId);
  const building = await makeBuilding(orgId, property.id);

  const occupied = await makeUnit(orgId, building.id, {
    unitNumber: "D-1",
    status: "occupied",
  });
  await makeUnit(orgId, building.id, { unitNumber: "D-2", status: "vacant" });
  await makeUnit(orgId, building.id, { unitNumber: "D-3", status: "vacant" });

  const tenant = await makeTenant(orgId);
  await makeLease(orgId, occupied.id, tenant.id, {
    monthlyRent: "2000.00",
    status: "active",
  });

  await makeMaintenanceRequest(orgId, occupied.id, { status: "submitted" });
  await makeMaintenanceRequest(orgId, occupied.id, { status: "completed" });

  // Noise in another org must not leak into this org's numbers.
  const other = await makeOrg();
  const otherProperty = await makeProperty(other.id);
  const otherBuilding = await makeBuilding(other.id, otherProperty.id);
  await makeUnit(other.id, otherBuilding.id, {
    unitNumber: "X-1",
    status: "occupied",
  });
});

describe("dashboard KPIs", () => {
  it("counts units and occupancy for the org only", async () => {
    const data = await getDashboardData(orgId);
    expect(data.kpis.totalUnits).toBe(3);
    expect(data.kpis.occupiedUnits).toBe(1);
    expect(data.kpis.vacantUnits).toBe(2);
    expect(data.kpis.occupancyRate).toBeCloseTo((1 / 3) * 100, 0);
  });

  it("sums monthly revenue from active leases", async () => {
    const data = await getDashboardData(orgId);
    expect(data.kpis.monthlyRevenue).toBe(2000);
  });

  it("counts only open maintenance requests", async () => {
    const data = await getDashboardData(orgId);
    expect(data.kpis.openMaintenanceRequests).toBe(1);
  });

  it("returns an occupancy breakdown consistent with unit statuses", async () => {
    const data = await getDashboardData(orgId);
    const byStatus = Object.fromEntries(
      data.occupancyBreakdown.map((o) => [o.status, o.count])
    );
    expect(byStatus["occupied"] ?? 0).toBe(1);
    expect(byStatus["vacant"] ?? 0).toBe(2);
  });
});
