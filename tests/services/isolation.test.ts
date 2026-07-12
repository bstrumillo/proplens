import { beforeAll, describe, expect, it } from "vitest";
import {
  resetDb,
  makeOrgWithLease,
  makePayment,
  makeMaintenanceRequest,
  makeVendor,
} from "../helpers/db";

import { getProperties, getPropertyById, updateProperty, deleteProperty } from "@/lib/services/properties";
import { getBuildings, getBuildingById } from "@/lib/services/buildings";
import { getUnits, getUnitById, updateUnit, deleteUnit } from "@/lib/services/units";
import { getTenants, getTenantById, updateTenant, deleteTenant } from "@/lib/services/tenants";
import { getLeases, getLeaseById, listLeasesByTenant } from "@/lib/services/leases";
import {
  getMaintenanceRequests,
  getMaintenanceRequestById,
  listMaintenanceByTenant,
} from "@/lib/services/maintenance";
import { getVendors, getVendorById, deleteVendor } from "@/lib/services/vendors";
import { listPaymentsByTenant } from "@/lib/services/payments";
import { getOrganization, listMembers } from "@/lib/services/organizations";

// Cross-tenant isolation: every service call scoped to org A must never
// return or mutate org B's rows. This suite is the compensating control for
// not using Postgres RLS — extend it with every new service.

type World = Awaited<ReturnType<typeof makeOrgWithLease>> & {
  payment: Awaited<ReturnType<typeof makePayment>>;
  maintenance: Awaited<ReturnType<typeof makeMaintenanceRequest>>;
  vendor: Awaited<ReturnType<typeof makeVendor>>;
};

let a: World;
let b: World;

async function makeWorld(): Promise<World> {
  const base = await makeOrgWithLease();
  const payment = await makePayment(base.org.id, base.lease.id, base.tenant.id);
  const maintenance = await makeMaintenanceRequest(base.org.id, base.unit.id, {
    tenantId: base.tenant.id,
  });
  const vendor = await makeVendor(base.org.id);
  return { ...base, payment, maintenance, vendor };
}

beforeAll(async () => {
  await resetDb();
  a = await makeWorld();
  b = await makeWorld();
});

const list = { page: 1, limit: 100 };

describe("properties isolation", () => {
  it("lists only own properties", async () => {
    const result = await getProperties(a.org.id, list);
    expect(result.data.map((p) => p.id)).toEqual([a.property.id]);
  });

  it("cannot read another org's property by id", async () => {
    expect(await getPropertyById(a.org.id, b.property.id)).toBeFalsy();
  });

  it("cannot update another org's property", async () => {
    await expect(
      updateProperty(a.org.id, b.property.id, { name: "Hacked" })
    ).rejects.toThrow();
    const untouched = await getPropertyById(b.org.id, b.property.id);
    expect(untouched?.name).toBe(b.property.name);
  });

  it("cannot delete another org's property", async () => {
    await expect(deleteProperty(a.org.id, b.property.id)).rejects.toThrow();
    expect(await getPropertyById(b.org.id, b.property.id)).toBeTruthy();
  });
});

describe("buildings isolation", () => {
  it("lists only own buildings", async () => {
    const result = await getBuildings(a.org.id, a.property.id);
    expect(result.map((x) => x.id)).toEqual([a.building.id]);
  });

  it("cannot read another org's building", async () => {
    expect(await getBuildingById(a.org.id, b.building.id)).toBeFalsy();
  });

  it("cannot list another org's buildings via its property id", async () => {
    const result = await getBuildings(a.org.id, b.property.id);
    expect(result).toEqual([]);
  });
});

describe("units isolation", () => {
  it("lists only own units", async () => {
    const result = await getUnits(a.org.id, list);
    expect(result.data.map((x) => x.id)).toEqual([a.unit.id]);
  });

  it("cannot read another org's unit", async () => {
    expect(await getUnitById(a.org.id, b.unit.id)).toBeFalsy();
  });

  it("cannot update another org's unit", async () => {
    await expect(
      updateUnit(a.org.id, b.unit.id, { unitNumber: "HACKED" })
    ).rejects.toThrow();
    const untouched = await getUnitById(b.org.id, b.unit.id);
    expect(untouched?.unitNumber).toBe(b.unit.unitNumber);
  });

  it("cannot delete another org's unit", async () => {
    await expect(deleteUnit(a.org.id, b.unit.id)).rejects.toThrow();
    expect(await getUnitById(b.org.id, b.unit.id)).toBeTruthy();
  });
});

describe("tenants isolation", () => {
  it("lists only own tenants", async () => {
    const result = await getTenants(a.org.id, list);
    expect(result.data.map((x) => x.id)).toEqual([a.tenant.id]);
  });

  it("cannot read another org's tenant", async () => {
    expect(await getTenantById(a.org.id, b.tenant.id)).toBeFalsy();
  });

  it("cannot update another org's tenant", async () => {
    await expect(
      updateTenant(a.org.id, b.tenant.id, { firstName: "Hacked" })
    ).rejects.toThrow();
    const untouched = await getTenantById(b.org.id, b.tenant.id);
    expect(untouched?.firstName).toBe(b.tenant.firstName);
  });

  it("cannot delete another org's tenant", async () => {
    await expect(deleteTenant(a.org.id, b.tenant.id)).rejects.toThrow();
    expect(await getTenantById(b.org.id, b.tenant.id)).toBeTruthy();
  });
});

describe("leases isolation", () => {
  it("lists only own leases", async () => {
    const result = await getLeases(a.org.id, list);
    expect(result.data.map((x) => x.id)).toEqual([a.lease.id]);
  });

  it("cannot read another org's lease", async () => {
    expect(await getLeaseById(a.org.id, b.lease.id)).toBeFalsy();
  });

  it("cannot list another org's tenant leases", async () => {
    const result = await listLeasesByTenant(a.org.id, b.tenant.id);
    expect(result).toEqual([]);
  });
});

describe("payments isolation", () => {
  it("lists only own tenant payments", async () => {
    const own = await listPaymentsByTenant(a.org.id, a.tenant.id);
    expect(own.map((x) => x.id)).toEqual([a.payment.id]);
  });

  it("cannot list another org's tenant payments", async () => {
    const result = await listPaymentsByTenant(a.org.id, b.tenant.id);
    expect(result).toEqual([]);
  });
});

describe("maintenance isolation", () => {
  it("lists only own requests", async () => {
    const result = await getMaintenanceRequests(a.org.id, list);
    expect(result.data.map((x) => x.id)).toEqual([a.maintenance.id]);
  });

  it("cannot read another org's request", async () => {
    expect(
      await getMaintenanceRequestById(a.org.id, b.maintenance.id)
    ).toBeFalsy();
  });

  it("cannot list another org's tenant maintenance", async () => {
    const result = await listMaintenanceByTenant(a.org.id, b.tenant.id);
    expect(result).toEqual([]);
  });
});

describe("vendors isolation", () => {
  it("lists only own vendors", async () => {
    const result = await getVendors(a.org.id, list);
    expect(result.data.map((x) => x.id)).toEqual([a.vendor.id]);
  });

  it("cannot read another org's vendor", async () => {
    expect(await getVendorById(a.org.id, b.vendor.id)).toBeFalsy();
  });

  it("cannot delete another org's vendor", async () => {
    await expect(deleteVendor(a.org.id, b.vendor.id)).rejects.toThrow();
    expect(await getVendorById(b.org.id, b.vendor.id)).toBeTruthy();
  });
});

describe("organizations isolation", () => {
  it("reads only the requested org", async () => {
    const org = await getOrganization(a.org.id);
    expect(org?.id).toBe(a.org.id);
  });

  it("does not leak members across orgs", async () => {
    const members = await listMembers(a.org.id);
    expect(members).toEqual([]);
  });
});
