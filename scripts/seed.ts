import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("🌱 Seeding PropForge database...");

  // ── Clear existing data (reverse dependency order) ────────────────────
  console.log("Clearing existing data...");
  await db.delete(schema.auditLog);
  await db.delete(schema.apiKeys);
  await db.delete(schema.financialTransactions);
  await db.delete(schema.financialCategories);
  await db.delete(schema.bankConnections);
  await db.delete(schema.vendorContracts);
  await db.delete(schema.vendors);
  await db.delete(schema.communications);
  await db.delete(schema.communicationTemplates);
  await db.delete(schema.workOrders);
  await db.delete(schema.maintenancePhotos);
  await db.delete(schema.maintenanceRequests);
  await db.delete(schema.payments);
  await db.delete(schema.paymentMethods);
  await db.delete(schema.leaseDocuments);
  await db.delete(schema.leases);
  await db.delete(schema.tenants);
  await db.delete(schema.units);
  await db.delete(schema.buildings);
  await db.delete(schema.properties);
  await db.delete(schema.organizationMembers);
  await db.delete(schema.organizations);

  // ── Organization ──────────────────────────────────────────────────────
  console.log("Creating organization...");
  const [org] = await db
    .insert(schema.organizations)
    .values({
      name: "Double Jack Properties LLC",
      slug: "double-jack-properties",
      email: "info@doublejackproperties.com",
      phone: "815-468-0000",
      address: "Double Jack Dr, Manteno, IL 60950",
      settings: {},
    })
    .returning();

  // ── Property ──────────────────────────────────────────────────────────
  console.log("Creating property and buildings...");
  const [property] = await db
    .insert(schema.properties)
    .values({
      organizationId: org.id,
      name: "Double Jack Drive Portfolio",
      addressLine1: "Double Jack Dr",
      city: "Manteno",
      state: "IL",
      zipCode: "60950",
      country: "US",
      type: "residential",
      status: "active",
      totalUnits: 37,
      description:
        "Multi-building residential portfolio on Double Jack Drive in Manteno, IL. Comprises 6 buildings with 37 total units including apartments and studios.",
    })
    .returning();

  // ── Buildings ─────────────────────────────────────────────────────────
  const buildingData = [
    { name: "636 Double Jack Dr", addressLine1: "636 Double Jack Dr", totalUnits: 6 },
    { name: "652 Double Jack Dr", addressLine1: "652 Double Jack Dr", totalUnits: 6 },
    { name: "702 Double Jack Dr", addressLine1: "702 Double Jack Dr", totalUnits: 6 },
    { name: "716 Double Jack Dr", addressLine1: "716 Double Jack Dr", totalUnits: 6 },
    { name: "720 Double Jack Dr", addressLine1: "720 Double Jack Dr", totalUnits: 7 },
    { name: "728 Double Jack Dr", addressLine1: "728 Double Jack Dr", totalUnits: 6 },
  ];

  const buildings = await db
    .insert(schema.buildings)
    .values(
      buildingData.map((b) => ({
        organizationId: org.id,
        propertyId: property.id,
        name: b.name,
        addressLine1: b.addressLine1,
        totalUnits: b.totalUnits,
        floors: 2,
      }))
    )
    .returning();

  // Map buildings by address number for easy lookup
  const bldg636 = buildings.find((b) => b.name.startsWith("636"))!;
  const bldg652 = buildings.find((b) => b.name.startsWith("652"))!;
  const bldg702 = buildings.find((b) => b.name.startsWith("702"))!;
  const bldg716 = buildings.find((b) => b.name.startsWith("716"))!;
  const bldg720 = buildings.find((b) => b.name.startsWith("720"))!;
  const bldg728 = buildings.find((b) => b.name.startsWith("728"))!;

  // ── Units ─────────────────────────────────────────────────────────────
  console.log("Creating units...");

  type UnitInput = {
    buildingId: string;
    unitNumber: string;
    type: "apartment" | "studio";
    bedrooms: number;
    bathrooms: string;
    sqft: string;
    marketRent: string;
    status: "occupied" | "vacant";
    isFurnished: boolean;
    isCorporate: boolean;
  };

  const unitDefs: UnitInput[] = [
    // ── Building 636 (6 units) ──
    { buildingId: bldg636.id, unitNumber: "636-A", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1450.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg636.id, unitNumber: "636-B", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1425.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg636.id, unitNumber: "636-C", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1150.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg636.id, unitNumber: "636-D", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1175.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg636.id, unitNumber: "636-E", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1150.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg636.id, unitNumber: "636-F", type: "studio", bedrooms: 1, bathrooms: "1.0", sqft: "550", marketRent: "875.00", status: "occupied", isFurnished: false, isCorporate: false },

    // ── Building 652 (6 units) ──
    { buildingId: bldg652.id, unitNumber: "652-A", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1450.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg652.id, unitNumber: "652-B", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1475.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg652.id, unitNumber: "652-C", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1200.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg652.id, unitNumber: "652-D", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1150.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg652.id, unitNumber: "652-E", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1476.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg652.id, unitNumber: "652-F", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "2502.00", status: "occupied", isFurnished: true, isCorporate: true },

    // ── Building 702 (6 units) ──
    { buildingId: bldg702.id, unitNumber: "702-A", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1475.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg702.id, unitNumber: "702-B", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1425.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg702.id, unitNumber: "702-C", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1175.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg702.id, unitNumber: "702-D", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1200.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg702.id, unitNumber: "702-E", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1150.00", status: "vacant", isFurnished: false, isCorporate: false },
    { buildingId: bldg702.id, unitNumber: "702-F", type: "studio", bedrooms: 1, bathrooms: "1.0", sqft: "550", marketRent: "900.00", status: "occupied", isFurnished: false, isCorporate: false },

    // ── Building 716 (6 units) ──
    { buildingId: bldg716.id, unitNumber: "716-A", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1500.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg716.id, unitNumber: "716-B", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1450.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg716.id, unitNumber: "716-C", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1175.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg716.id, unitNumber: "716-D", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1200.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg716.id, unitNumber: "716-E", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1175.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg716.id, unitNumber: "716-F", type: "studio", bedrooms: 1, bathrooms: "1.0", sqft: "550", marketRent: "850.00", status: "occupied", isFurnished: false, isCorporate: false },

    // ── Building 720 (7 units) ──
    { buildingId: bldg720.id, unitNumber: "720-A", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1475.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg720.id, unitNumber: "720-B", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1450.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg720.id, unitNumber: "720-C", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1200.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg720.id, unitNumber: "720-D", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1150.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg720.id, unitNumber: "720-E", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1175.00", status: "vacant", isFurnished: false, isCorporate: false },
    { buildingId: bldg720.id, unitNumber: "720-F", type: "studio", bedrooms: 1, bathrooms: "1.0", sqft: "550", marketRent: "875.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg720.id, unitNumber: "720-G", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1150.00", status: "occupied", isFurnished: false, isCorporate: false },

    // ── Building 728 (6 units) ──
    { buildingId: bldg728.id, unitNumber: "728-A", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1500.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg728.id, unitNumber: "728-B", type: "apartment", bedrooms: 3, bathrooms: "2.0", sqft: "1200", marketRent: "1475.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg728.id, unitNumber: "728-C", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1200.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg728.id, unitNumber: "728-D", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1175.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg728.id, unitNumber: "728-E", type: "apartment", bedrooms: 2, bathrooms: "1.5", sqft: "950", marketRent: "1150.00", status: "occupied", isFurnished: false, isCorporate: false },
    { buildingId: bldg728.id, unitNumber: "728-F", type: "studio", bedrooms: 1, bathrooms: "1.0", sqft: "550", marketRent: "900.00", status: "occupied", isFurnished: false, isCorporate: false },
  ];

  const units = await db
    .insert(schema.units)
    .values(
      unitDefs.map((u) => ({
        organizationId: org.id,
        buildingId: u.buildingId,
        unitNumber: u.unitNumber,
        type: u.type,
        status: u.status,
        bedrooms: u.bedrooms,
        bathrooms: u.bathrooms,
        sqft: u.sqft,
        marketRent: u.marketRent,
        currentRent: u.marketRent,
        depositAmount: u.marketRent,
        isFurnished: u.isFurnished,
        isCorporate: u.isCorporate,
        amenities: [],
      }))
    )
    .returning();

  // Helper to look up a unit by number
  const unitByNumber = (num: string) => units.find((u) => u.unitNumber === num)!;

  // ── Tenants ───────────────────────────────────────────────────────────
  console.log("Creating tenants...");

  // Occupied units (35 total minus 2 vacant = 33 residential + 1 corporate = 34)
  // Vacant: 702-E, 720-E
  // Corporate: 652-F (Gotion Inc.)
  const tenantDefs: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    unitNumber: string;
    employer?: string;
  }[] = [
    // ── Building 636 ──
    { firstName: "Marcus", lastName: "Williams", email: "marcus.williams@email.com", phone: "815-555-0101", unitNumber: "636-A", employer: "Caterpillar Inc." },
    { firstName: "Sarah", lastName: "Chen", email: "sarah.chen@email.com", phone: "815-555-0102", unitNumber: "636-B", employer: "Riverside Health System" },
    { firstName: "Devon", lastName: "Mitchell", email: "devon.mitchell@email.com", phone: "815-555-0103", unitNumber: "636-C", employer: "Manteno School District" },
    { firstName: "Angela", lastName: "Foster", email: "angela.foster@email.com", phone: "815-555-0104", unitNumber: "636-D", employer: "Walmart" },
    { firstName: "James", lastName: "Rodriguez", email: "james.rodriguez@email.com", phone: "815-555-0105", unitNumber: "636-E", employer: "USPS" },
    { firstName: "Tina", lastName: "Patel", email: "tina.patel@email.com", phone: "815-555-0106", unitNumber: "636-F", employer: "Self-employed" },

    // ── Building 652 ──
    { firstName: "Robert", lastName: "Johnson", email: "robert.johnson@email.com", phone: "815-555-0201", unitNumber: "652-A", employer: "Nucor Steel" },
    { firstName: "Lisa", lastName: "Nguyen", email: "lisa.nguyen@email.com", phone: "815-555-0202", unitNumber: "652-B", employer: "Presence St. Mary's" },
    { firstName: "Michael", lastName: "Thompson", email: "michael.thompson@email.com", phone: "815-555-0203", unitNumber: "652-C", employer: "Kankakee County" },
    { firstName: "Jennifer", lastName: "Davis", email: "jennifer.davis@email.com", phone: "815-555-0204", unitNumber: "652-D", employer: "Olivet Nazarene University" },
    { firstName: "Christopher", lastName: "Martinez", email: "christopher.martinez@email.com", phone: "815-555-0205", unitNumber: "652-E", employer: "CSL Behring" },
    // 652-F is corporate tenant
    { firstName: "Gotion", lastName: "Inc.", email: "housing@gotion.com", phone: "815-555-0206", unitNumber: "652-F", employer: "Gotion Inc." },

    // ── Building 702 ──
    { firstName: "David", lastName: "Wilson", email: "david.wilson@email.com", phone: "815-555-0301", unitNumber: "702-A", employer: "Shapiro Developmental Center" },
    { firstName: "Amanda", lastName: "Brown", email: "amanda.brown@email.com", phone: "815-555-0302", unitNumber: "702-B", employer: "Manteno Village" },
    { firstName: "Kevin", lastName: "Garcia", email: "kevin.garcia@email.com", phone: "815-555-0303", unitNumber: "702-C", employer: "Amazon" },
    { firstName: "Stephanie", lastName: "Lee", email: "stephanie.lee@email.com", phone: "815-555-0304", unitNumber: "702-D", employer: "BCBS Illinois" },
    // 702-E is vacant
    { firstName: "Brian", lastName: "Taylor", email: "brian.taylor@email.com", phone: "815-555-0306", unitNumber: "702-F", employer: "Self-employed" },

    // ── Building 716 ──
    { firstName: "Daniel", lastName: "Anderson", email: "daniel.anderson@email.com", phone: "815-555-0401", unitNumber: "716-A", employer: "Riverside Medical Center" },
    { firstName: "Rachel", lastName: "Thomas", email: "rachel.thomas@email.com", phone: "815-555-0402", unitNumber: "716-B", employer: "State Farm" },
    { firstName: "Anthony", lastName: "Jackson", email: "anthony.jackson@email.com", phone: "815-555-0403", unitNumber: "716-C", employer: "FedEx Ground" },
    { firstName: "Michelle", lastName: "White", email: "michelle.white@email.com", phone: "815-555-0404", unitNumber: "716-D", employer: "Manteno School District" },
    { firstName: "Jason", lastName: "Harris", email: "jason.harris@email.com", phone: "815-555-0405", unitNumber: "716-E", employer: "Kankakee Valley Park District" },
    { firstName: "Laura", lastName: "Clark", email: "laura.clark@email.com", phone: "815-555-0406", unitNumber: "716-F", employer: "Walgreens" },

    // ── Building 720 ──
    { firstName: "Ryan", lastName: "Lewis", email: "ryan.lewis@email.com", phone: "815-555-0501", unitNumber: "720-A", employer: "Illinois DOT" },
    { firstName: "Nicole", lastName: "Robinson", email: "nicole.robinson@email.com", phone: "815-555-0502", unitNumber: "720-B", employer: "Presence St. Mary's" },
    { firstName: "Patrick", lastName: "Walker", email: "patrick.walker@email.com", phone: "815-555-0503", unitNumber: "720-C", employer: "Home Depot" },
    { firstName: "Samantha", lastName: "Hall", email: "samantha.hall@email.com", phone: "815-555-0504", unitNumber: "720-D", employer: "Kankakee Community College" },
    // 720-E is vacant
    { firstName: "Tyler", lastName: "Allen", email: "tyler.allen@email.com", phone: "815-555-0506", unitNumber: "720-F", employer: "Self-employed" },
    { firstName: "Megan", lastName: "Young", email: "megan.young@email.com", phone: "815-555-0507", unitNumber: "720-G", employer: "Target" },

    // ── Building 728 ──
    { firstName: "Eric", lastName: "King", email: "eric.king@email.com", phone: "815-555-0601", unitNumber: "728-A", employer: "CSL Behring" },
    { firstName: "Heather", lastName: "Wright", email: "heather.wright@email.com", phone: "815-555-0602", unitNumber: "728-B", employer: "Riverside Health System" },
    { firstName: "Brandon", lastName: "Lopez", email: "brandon.lopez@email.com", phone: "815-555-0603", unitNumber: "728-C", employer: "Nucor Steel" },
    { firstName: "Christina", lastName: "Hill", email: "christina.hill@email.com", phone: "815-555-0604", unitNumber: "728-D", employer: "Walmart" },
    { firstName: "Justin", lastName: "Scott", email: "justin.scott@email.com", phone: "815-555-0605", unitNumber: "728-E", employer: "Kankakee County Sheriff" },
    { firstName: "Ashley", lastName: "Green", email: "ashley.green@email.com", phone: "815-555-0606", unitNumber: "728-F", employer: "Walgreens" },
  ];

  const tenants = await db
    .insert(schema.tenants)
    .values(
      tenantDefs.map((t) => ({
        organizationId: org.id,
        firstName: t.firstName,
        lastName: t.lastName,
        email: t.email,
        phone: t.phone,
        employer: t.employer,
      }))
    )
    .returning();

  // Build a map: unitNumber -> tenant
  const tenantByUnit = new Map<string, (typeof tenants)[0]>();
  tenantDefs.forEach((td, i) => {
    tenantByUnit.set(td.unitNumber, tenants[i]);
  });

  // ── Leases ────────────────────────────────────────────────────────────
  console.log("Creating leases...");

  // Lease start dates spread between 2024-03-01 and 2025-06-01
  const leaseStartDates: Record<string, string> = {
    "636-A": "2024-06-01",
    "636-B": "2024-08-01",
    "636-C": "2024-04-01",
    "636-D": "2024-05-01",
    "636-E": "2024-09-01",
    "636-F": "2024-07-01", // month-to-month
    "652-A": "2024-03-01",
    "652-B": "2025-01-01",
    "652-C": "2024-10-01",
    "652-D": "2024-04-01",
    "652-E": "2025-02-01",
    "652-F": "2024-09-01", // corporate
    "702-A": "2024-07-01",
    "702-B": "2024-05-01",
    "702-C": "2025-03-01",
    "702-D": "2024-11-01",
    "702-F": "2024-08-01", // month-to-month
    "716-A": "2024-03-01",
    "716-B": "2024-06-01",
    "716-C": "2025-01-01",
    "716-D": "2024-12-01",
    "716-E": "2024-04-01",
    "716-F": "2025-06-01",
    "720-A": "2024-05-01",
    "720-B": "2024-08-01",
    "720-C": "2024-10-01",
    "720-D": "2025-04-01",
    "720-F": "2024-07-01",
    "720-G": "2024-09-01",
    "728-A": "2024-03-01",
    "728-B": "2024-06-01",
    "728-C": "2025-05-01",
    "728-D": "2024-11-01",
    "728-E": "2024-04-01",
    "728-F": "2024-12-01",
  };

  // Determine lease type and compute end date
  function getLeaseType(unitNum: string): "fixed" | "month_to_month" | "corporate" {
    if (unitNum === "652-F") return "corporate";
    if (unitNum === "636-F" || unitNum === "702-F") return "month_to_month";
    return "fixed";
  }

  function addMonths(dateStr: string, months: number): string {
    const d = new Date(dateStr + "T00:00:00");
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0];
  }

  // Build lease values for each occupied unit with a tenant
  const occupiedUnitsWithTenants = Array.from(tenantByUnit.entries());

  const leaseValues = occupiedUnitsWithTenants.map(([unitNum, tenant]) => {
    const unit = unitByNumber(unitNum);
    const leaseType = getLeaseType(unitNum);
    const startDate = leaseStartDates[unitNum];
    const endDate = leaseType === "month_to_month" ? null : addMonths(startDate, 12);
    const monthlyRent = unit.marketRent!;
    const furnishedPremium = unitNum === "652-F" ? "1026.00" : null;

    return {
      organizationId: org.id,
      unitId: unit.id,
      tenantId: tenant.id,
      status: "active" as const,
      type: leaseType,
      startDate,
      endDate,
      monthlyRent,
      securityDeposit: monthlyRent,
      furnishedPremium: furnishedPremium,
      rentDueDay: 1,
      lateFeeAmount: "50.00",
      lateFeeGraceDays: 5,
      autoRenew: leaseType === "month_to_month",
      notes:
        unitNum === "652-F"
          ? "Corporate housing lease for Gotion Inc. employee relocation program. Furnished unit with premium."
          : null,
    };
  });

  const leases = await db
    .insert(schema.leases)
    .values(leaseValues)
    .returning();

  // Build a map: unitNumber -> lease
  const leaseByUnit = new Map<string, (typeof leases)[0]>();
  occupiedUnitsWithTenants.forEach(([unitNum], i) => {
    leaseByUnit.set(unitNum, leases[i]);
  });

  // ── Update unit references ────────────────────────────────────────────
  console.log("Updating unit references...");
  for (const [unitNum, tenant] of tenantByUnit.entries()) {
    const unit = unitByNumber(unitNum);
    const lease = leaseByUnit.get(unitNum);
    if (unit && lease) {
      await db
        .update(schema.units)
        .set({
          currentTenantId: tenant.id,
          currentLeaseId: lease.id,
        })
        .where(eq(schema.units.id, unit.id));
    }
  }

  // ── Vendor ────────────────────────────────────────────────────────────
  console.log("Creating vendor...");
  const [vendor] = await db
    .insert(schema.vendors)
    .values({
      organizationId: org.id,
      name: "Jason Grove",
      companyName: "Grove Maintenance Services",
      email: "jason@grovemaintenance.com",
      phone: "815-555-0700",
      address: "412 N Locust St, Manteno, IL 60950",
      specialties: ["plumbing", "electrical", "hvac", "general", "appliance"],
      hourlyRate: "65.00",
      status: "active",
      rating: "4.20",
      totalJobs: 156,
      notes: "Primary maintenance vendor for all Double Jack Drive properties. Available for emergency calls.",
    })
    .returning();

  // ── Financial Categories ──────────────────────────────────────────────
  console.log("Creating financial categories...");

  const categoryDefs = [
    // Income categories
    { name: "Rent Income", type: "income" as const, code: "4100", description: "Monthly rental income from residential units" },
    { name: "Late Fee Income", type: "income" as const, code: "4200", description: "Late payment fees collected from tenants" },
    { name: "Other Income", type: "income" as const, code: "4900", description: "Miscellaneous income including application fees, pet fees, etc." },
    // Expense categories
    { name: "Maintenance & Repairs", type: "expense" as const, code: "5100", description: "Routine maintenance, repairs, and service calls" },
    { name: "Property Management", type: "expense" as const, code: "5200", description: "Property management fees and administrative costs" },
    { name: "Insurance", type: "expense" as const, code: "5300", description: "Property insurance premiums" },
    { name: "Property Taxes", type: "expense" as const, code: "5400", description: "Annual property tax payments" },
    { name: "Utilities", type: "expense" as const, code: "5500", description: "Water, sewer, common area electric, trash removal" },
    { name: "Landscaping", type: "expense" as const, code: "5600", description: "Lawn care, snow removal, and grounds maintenance" },
    { name: "Legal & Professional", type: "expense" as const, code: "5700", description: "Legal fees, accounting, and professional services" },
    { name: "Capital Improvements", type: "expense" as const, code: "5800", description: "Major property improvements, renovations, and equipment" },
  ];

  const categories = await db
    .insert(schema.financialCategories)
    .values(
      categoryDefs.map((c) => ({
        organizationId: org.id,
        name: c.name,
        type: c.type,
        code: c.code,
        description: c.description,
        isSystem: true,
      }))
    )
    .returning();

  // Map category by code for easy lookup
  const catByCode = new Map<string, (typeof categories)[0]>();
  categories.forEach((c) => {
    if (c.code) catByCode.set(c.code, c);
  });

  const catRentIncome = catByCode.get("4100")!;
  const catLateFee = catByCode.get("4200")!;
  const catOtherIncome = catByCode.get("4900")!;
  const catMaintenance = catByCode.get("5100")!;
  const catManagement = catByCode.get("5200")!;
  const catInsurance = catByCode.get("5300")!;
  const catTaxes = catByCode.get("5400")!;
  const catUtilities = catByCode.get("5500")!;
  const catLandscaping = catByCode.get("5600")!;
  const catLegal = catByCode.get("5700")!;
  const catCapital = catByCode.get("5800")!;

  // ── Financial Transactions (2024) ─────────────────────────────────────
  console.log("Creating financial transactions...");

  type TxnInput = {
    categoryId: string;
    type: "income" | "expense";
    amount: string;
    date: string;
    description: string;
    vendorId?: string;
  };

  const transactions: TxnInput[] = [];

  // ── Monthly Rent Income (Jan-Dec 2024) ────────────────────────────────
  // Total rent per month from all occupied units ~$44,823
  // Approximate annual: $44,823 * 12 = $537,876 base
  // Corporate unit came online Sep 2024, so adjust accordingly
  // Target approximately $644K total for 2024

  // Monthly rent collection amounts (slightly varied to reflect real-world)
  const monthlyRentAmounts = [
    { month: "2024-01-15", amount: "49250.00", desc: "Rent collection - January 2024" },
    { month: "2024-02-15", amount: "49250.00", desc: "Rent collection - February 2024" },
    { month: "2024-03-15", amount: "50875.00", desc: "Rent collection - March 2024" },
    { month: "2024-04-15", amount: "51450.00", desc: "Rent collection - April 2024" },
    { month: "2024-05-15", amount: "52100.00", desc: "Rent collection - May 2024" },
    { month: "2024-06-15", amount: "53225.00", desc: "Rent collection - June 2024" },
    { month: "2024-07-15", amount: "54400.00", desc: "Rent collection - July 2024" },
    { month: "2024-08-15", amount: "55150.00", desc: "Rent collection - August 2024" },
    { month: "2024-09-15", amount: "56725.00", desc: "Rent collection - September 2024" },
    { month: "2024-10-15", amount: "57100.00", desc: "Rent collection - October 2024" },
    { month: "2024-11-15", amount: "57350.00", desc: "Rent collection - November 2024" },
    { month: "2024-12-15", amount: "57125.00", desc: "Rent collection - December 2024" },
  ];
  // Total: ~$644,000

  for (const rent of monthlyRentAmounts) {
    transactions.push({
      categoryId: catRentIncome.id,
      type: "income",
      amount: rent.amount,
      date: rent.month,
      description: rent.desc,
    });
  }

  // ── Late Fee Income (scattered) ──
  const lateFees = [
    { date: "2024-02-10", amount: "50.00", desc: "Late fee - Unit 636-D" },
    { date: "2024-03-10", amount: "50.00", desc: "Late fee - Unit 716-C" },
    { date: "2024-05-10", amount: "100.00", desc: "Late fees - Units 720-C, 728-D" },
    { date: "2024-07-10", amount: "50.00", desc: "Late fee - Unit 652-D" },
    { date: "2024-08-10", amount: "50.00", desc: "Late fee - Unit 636-E" },
    { date: "2024-10-10", amount: "100.00", desc: "Late fees - Units 702-C, 716-E" },
    { date: "2024-11-10", amount: "50.00", desc: "Late fee - Unit 720-G" },
  ];

  for (const lf of lateFees) {
    transactions.push({
      categoryId: catLateFee.id,
      type: "income",
      amount: lf.amount,
      date: lf.date,
      description: lf.desc,
    });
  }

  // ── Other Income ──
  transactions.push({
    categoryId: catOtherIncome.id,
    type: "income",
    amount: "750.00",
    date: "2024-03-01",
    description: "Application fees - 3 units",
  });
  transactions.push({
    categoryId: catOtherIncome.id,
    type: "income",
    amount: "500.00",
    date: "2024-06-15",
    description: "Application fees - 2 units",
  });
  transactions.push({
    categoryId: catOtherIncome.id,
    type: "income",
    amount: "300.00",
    date: "2024-09-10",
    description: "Pet deposit - Unit 728-C",
  });

  // ── Maintenance & Repairs (~$107K) ────────────────────────────────────
  const maintenanceExpenses = [
    { date: "2024-01-08", amount: "3250.00", desc: "Emergency pipe burst repair - 636 building" },
    { date: "2024-01-22", amount: "1875.00", desc: "HVAC furnace repair - Units 652-A, 652-B" },
    { date: "2024-02-05", amount: "2400.00", desc: "Water heater replacements - 702 building" },
    { date: "2024-02-19", amount: "1650.00", desc: "Plumbing repairs - Units 716-C, 716-D" },
    { date: "2024-03-04", amount: "4200.00", desc: "HVAC system service - entire 720 building" },
    { date: "2024-03-18", amount: "2850.00", desc: "Electrical panel upgrade - 728 building" },
    { date: "2024-04-01", amount: "3100.00", desc: "Spring maintenance - all buildings common areas" },
    { date: "2024-04-15", amount: "1925.00", desc: "Appliance repairs - dishwashers Units 636-A, 652-C, 716-B" },
    { date: "2024-05-06", amount: "5600.00", desc: "Roof leak repairs - 636 and 652 buildings" },
    { date: "2024-05-20", amount: "2200.00", desc: "Plumbing - sewer line cleaning all buildings" },
    { date: "2024-06-03", amount: "3400.00", desc: "A/C maintenance and Freon recharge - multiple units" },
    { date: "2024-06-17", amount: "1800.00", desc: "Garbage disposal and faucet replacements" },
    { date: "2024-07-01", amount: "4500.00", desc: "Emergency HVAC compressor replacement - 716 building" },
    { date: "2024-07-15", amount: "2750.00", desc: "Drywall and paint repairs - turnover Unit 702-E" },
    { date: "2024-08-05", amount: "6200.00", desc: "Plumbing overhaul - 728 building main line" },
    { date: "2024-08-19", amount: "3850.00", desc: "Electrical repairs and outlet upgrades - 636, 702" },
    { date: "2024-09-02", amount: "5100.00", desc: "Furnace inspections and tune-ups - all buildings" },
    { date: "2024-09-16", amount: "2950.00", desc: "Appliance replacements - stoves Units 720-A, 720-D" },
    { date: "2024-10-07", amount: "8500.00", desc: "Boiler repair and heating system prep - all buildings" },
    { date: "2024-10-21", amount: "4200.00", desc: "Window seal replacements - 652, 716 buildings" },
    { date: "2024-11-04", amount: "9750.00", desc: "Emergency water main repair and restoration" },
    { date: "2024-11-18", amount: "6800.00", desc: "HVAC emergency repairs - cold snap response" },
    { date: "2024-12-02", amount: "12500.00", desc: "End-of-year comprehensive maintenance - all buildings" },
    { date: "2024-12-16", amount: "5150.00", desc: "Plumbing winterization and pipe insulation" },
  ];
  // Total: ~$107,400

  for (const maint of maintenanceExpenses) {
    transactions.push({
      categoryId: catMaintenance.id,
      type: "expense",
      amount: maint.amount,
      date: maint.date,
      description: maint.desc,
      vendorId: vendor.id,
    });
  }

  // ── Insurance (~$45K) ─────────────────────────────────────────────────
  const insuranceExpenses = [
    { date: "2024-01-15", amount: "11250.00", desc: "Property insurance - Q1 2024 premium" },
    { date: "2024-04-15", amount: "11250.00", desc: "Property insurance - Q2 2024 premium" },
    { date: "2024-07-15", amount: "11250.00", desc: "Property insurance - Q3 2024 premium" },
    { date: "2024-10-15", amount: "11250.00", desc: "Property insurance - Q4 2024 premium" },
  ];

  for (const ins of insuranceExpenses) {
    transactions.push({
      categoryId: catInsurance.id,
      type: "expense",
      amount: ins.amount,
      date: ins.date,
      description: ins.desc,
    });
  }

  // ── Property Taxes (~$52K) ────────────────────────────────────────────
  const taxExpenses = [
    { date: "2024-03-01", amount: "26000.00", desc: "Property tax - first installment 2024" },
    { date: "2024-09-01", amount: "26000.00", desc: "Property tax - second installment 2024" },
  ];

  for (const tax of taxExpenses) {
    transactions.push({
      categoryId: catTaxes.id,
      type: "expense",
      amount: tax.amount,
      date: tax.date,
      description: tax.desc,
    });
  }

  // ── Utilities (~$38K) ─────────────────────────────────────────────────
  const utilityExpenses = [
    { date: "2024-01-20", amount: "3800.00", desc: "Utilities - January (water, sewer, common electric, trash)" },
    { date: "2024-02-20", amount: "3650.00", desc: "Utilities - February" },
    { date: "2024-03-20", amount: "3200.00", desc: "Utilities - March" },
    { date: "2024-04-20", amount: "2900.00", desc: "Utilities - April" },
    { date: "2024-05-20", amount: "2750.00", desc: "Utilities - May" },
    { date: "2024-06-20", amount: "2800.00", desc: "Utilities - June" },
    { date: "2024-07-20", amount: "3100.00", desc: "Utilities - July" },
    { date: "2024-08-20", amount: "3250.00", desc: "Utilities - August" },
    { date: "2024-09-20", amount: "2900.00", desc: "Utilities - September" },
    { date: "2024-10-20", amount: "3050.00", desc: "Utilities - October" },
    { date: "2024-11-20", amount: "3350.00", desc: "Utilities - November" },
    { date: "2024-12-20", amount: "3650.00", desc: "Utilities - December" },
  ];
  // Total: ~$38,400

  for (const util of utilityExpenses) {
    transactions.push({
      categoryId: catUtilities.id,
      type: "expense",
      amount: util.amount,
      date: util.date,
      description: util.desc,
    });
  }

  // ── Property Management (~$65K) ───────────────────────────────────────
  const managementExpenses = [
    { date: "2024-01-31", amount: "5416.00", desc: "Property management fee - January 2024" },
    { date: "2024-02-29", amount: "5416.00", desc: "Property management fee - February 2024" },
    { date: "2024-03-31", amount: "5416.00", desc: "Property management fee - March 2024" },
    { date: "2024-04-30", amount: "5416.00", desc: "Property management fee - April 2024" },
    { date: "2024-05-31", amount: "5416.00", desc: "Property management fee - May 2024" },
    { date: "2024-06-30", amount: "5416.00", desc: "Property management fee - June 2024" },
    { date: "2024-07-31", amount: "5416.00", desc: "Property management fee - July 2024" },
    { date: "2024-08-31", amount: "5416.00", desc: "Property management fee - August 2024" },
    { date: "2024-09-30", amount: "5417.00", desc: "Property management fee - September 2024" },
    { date: "2024-10-31", amount: "5417.00", desc: "Property management fee - October 2024" },
    { date: "2024-11-30", amount: "5417.00", desc: "Property management fee - November 2024" },
    { date: "2024-12-31", amount: "5420.00", desc: "Property management fee - December 2024" },
  ];
  // Total: ~$65,000

  for (const mgmt of managementExpenses) {
    transactions.push({
      categoryId: catManagement.id,
      type: "expense",
      amount: mgmt.amount,
      date: mgmt.date,
      description: mgmt.desc,
    });
  }

  // ── Landscaping (~$18K) ───────────────────────────────────────────────
  const landscapingExpenses = [
    { date: "2024-01-15", amount: "1200.00", desc: "Snow removal - January" },
    { date: "2024-02-15", amount: "1400.00", desc: "Snow removal - February" },
    { date: "2024-03-15", amount: "800.00", desc: "Snow removal and spring cleanup" },
    { date: "2024-04-15", amount: "1500.00", desc: "Spring landscaping - mulch, planting, cleanup" },
    { date: "2024-05-15", amount: "1200.00", desc: "Lawn maintenance - May" },
    { date: "2024-06-15", amount: "1200.00", desc: "Lawn maintenance - June" },
    { date: "2024-07-15", amount: "1400.00", desc: "Lawn maintenance and tree trimming - July" },
    { date: "2024-08-15", amount: "1200.00", desc: "Lawn maintenance - August" },
    { date: "2024-09-15", amount: "1200.00", desc: "Lawn maintenance - September" },
    { date: "2024-10-15", amount: "2000.00", desc: "Fall cleanup and leaf removal" },
    { date: "2024-11-15", amount: "1800.00", desc: "Winterization and snow prep" },
    { date: "2024-12-15", amount: "3100.00", desc: "Snow removal - December (heavy storms)" },
  ];
  // Total: ~$18,000

  for (const land of landscapingExpenses) {
    transactions.push({
      categoryId: catLandscaping.id,
      type: "expense",
      amount: land.amount,
      date: land.date,
      description: land.desc,
    });
  }

  // ── Legal & Professional (~$12K) ──────────────────────────────────────
  const legalExpenses = [
    { date: "2024-02-15", amount: "2500.00", desc: "Annual tax preparation and accounting services" },
    { date: "2024-04-10", amount: "1800.00", desc: "Lease review and legal consultation" },
    { date: "2024-06-20", amount: "3200.00", desc: "Eviction proceedings and legal representation" },
    { date: "2024-09-05", amount: "1500.00", desc: "Corporate lease drafting - Gotion Inc." },
    { date: "2024-11-15", amount: "3000.00", desc: "Year-end legal review and compliance audit" },
  ];
  // Total: $12,000

  for (const legal of legalExpenses) {
    transactions.push({
      categoryId: catLegal.id,
      type: "expense",
      amount: legal.amount,
      date: legal.date,
      description: legal.desc,
    });
  }

  // ── Capital Improvements (~$83K) ──────────────────────────────────────
  const capitalExpenses = [
    { date: "2024-01-20", amount: "12000.00", desc: "New roof sections - 636 building" },
    { date: "2024-03-10", amount: "8500.00", desc: "Parking lot resurfacing - Phase 1" },
    { date: "2024-04-25", amount: "15000.00", desc: "HVAC system replacement - 728 building" },
    { date: "2024-06-01", amount: "6500.00", desc: "Security camera system installation" },
    { date: "2024-07-20", amount: "9800.00", desc: "Bathroom renovations - vacant units turnover" },
    { date: "2024-08-15", amount: "7200.00", desc: "Energy-efficient window installation - 716 building" },
    { date: "2024-09-25", amount: "5500.00", desc: "Laundry room equipment upgrade" },
    { date: "2024-10-10", amount: "8500.00", desc: "Parking lot resurfacing - Phase 2" },
    { date: "2024-11-20", amount: "6000.00", desc: "LED lighting conversion - all common areas" },
    { date: "2024-12-10", amount: "4000.00", desc: "Exterior painting touch-up - 652, 702 buildings" },
  ];
  // Total: $83,000

  for (const cap of capitalExpenses) {
    transactions.push({
      categoryId: catCapital.id,
      type: "expense",
      amount: cap.amount,
      date: cap.date,
      description: cap.desc,
    });
  }

  // ── Insert all transactions in batches ────────────────────────────────
  const txnBatchSize = 50;
  for (let i = 0; i < transactions.length; i += txnBatchSize) {
    const batch = transactions.slice(i, i + txnBatchSize);
    await db.insert(schema.financialTransactions).values(
      batch.map((t) => ({
        organizationId: org.id,
        propertyId: property.id,
        categoryId: t.categoryId,
        type: t.type,
        amount: t.amount,
        currency: "USD",
        date: t.date,
        description: t.description,
        vendorId: t.vendorId ?? null,
        isReconciled: true,
      }))
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  console.log("");
  console.log("══════════════════════════════════════════════════");
  console.log("✅ Seeding complete!");
  console.log("══════════════════════════════════════════════════");
  console.log(`  Organization: ${org.name}`);
  console.log(`  Property:     ${property.name}`);
  console.log(`  Buildings:    ${buildings.length}`);
  console.log(`  Units:        ${units.length} (${units.filter((u) => u.status === "occupied").length} occupied, ${units.filter((u) => u.status === "vacant").length} vacant)`);
  console.log(`  Tenants:      ${tenants.length}`);
  console.log(`  Leases:       ${leases.length}`);
  console.log(`  Vendor:       ${vendor.name} (${vendor.companyName})`);
  console.log(`  Categories:   ${categories.length}`);
  console.log(`  Transactions: ${transactions.length}`);
  console.log(`  2024 Income:  $${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  console.log(`  2024 Expense: $${totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  console.log(`  2024 NOI:     $${(totalIncome - totalExpense).toLocaleString("en-US", { minimumFractionDigits: 2 })}`);
  console.log("══════════════════════════════════════════════════");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
