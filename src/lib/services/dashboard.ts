import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// ── Types ────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
  openMaintenanceRequests: number;
  expiringLeases30Days: number;
  expiringLeases90Days: number;
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
}

export interface RentCollectionUnit {
  unitNumber: string;
  tenantName: string;
  monthlyRent: number;
  amountPaid: number;
  status: "paid" | "partial" | "pending" | "overdue";
  paymentDate: string | null;
  paymentMethod: string | null;
}

export interface LeaseExpirationMonth {
  month: string;
  label: string;
  count: number;
  units: { unitNumber: string; tenantName: string; endDate: string }[];
}

export interface OccupancyBreakdown {
  status: string;
  count: number;
  fill: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  rentCollection: RentCollectionUnit[];
  leaseTimeline: LeaseExpirationMonth[];
  occupancyBreakdown: OccupancyBreakdown[];
}

// ── Service ──────────────────────────────────────────────────────────

export async function getDashboardData(
  organizationId: string
): Promise<DashboardData> {
  const [kpis, rentCollection, leaseTimeline, occupancyBreakdown] =
    await Promise.all([
      getKPIs(organizationId),
      getRentCollection(organizationId),
      getLeaseTimeline(organizationId),
      getOccupancyBreakdown(organizationId),
    ]);

  return { kpis, rentCollection, leaseTimeline, occupancyBreakdown };
}

// ── KPIs ─────────────────────────────────────────────────────────────

async function getKPIs(organizationId: string): Promise<DashboardKPIs> {
  const unitStats = await db.execute<{
    total_units: string;
    occupied_units: string;
    vacant_units: string;
  }>(sql`
    SELECT
      COUNT(*)::text AS total_units,
      COUNT(*) FILTER (WHERE status = 'occupied')::text AS occupied_units,
      COUNT(*) FILTER (WHERE status = 'vacant')::text AS vacant_units
    FROM units
    WHERE organization_id = ${organizationId}
  `);

  const totalUnits = parseInt(unitStats.rows[0]?.total_units ?? "0", 10);
  const occupiedUnits = parseInt(unitStats.rows[0]?.occupied_units ?? "0", 10);
  const vacantUnits = parseInt(unitStats.rows[0]?.vacant_units ?? "0", 10);
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  const revenueResult = await db.execute<{ total_revenue: string }>(sql`
    SELECT COALESCE(SUM(monthly_rent), 0)::text AS total_revenue
    FROM leases
    WHERE organization_id = ${organizationId}
      AND status = 'active'
  `);
  const monthlyRevenue = parseFloat(revenueResult.rows[0]?.total_revenue ?? "0");

  const maintenanceResult = await db.execute<{ open_count: string }>(sql`
    SELECT COUNT(*)::text AS open_count
    FROM maintenance_requests
    WHERE organization_id = ${organizationId}
      AND status NOT IN ('completed', 'closed', 'cancelled')
  `);
  const openMaintenanceRequests = parseInt(maintenanceResult.rows[0]?.open_count ?? "0", 10);

  // Leases expiring within 30 and 90 days
  const expiringResult = await db.execute<{
    expiring_30: string;
    expiring_90: string;
  }>(sql`
    SELECT
      COUNT(*) FILTER (
        WHERE end_date <= CURRENT_DATE + INTERVAL '30 days'
          AND end_date >= CURRENT_DATE
      )::text AS expiring_30,
      COUNT(*) FILTER (
        WHERE end_date <= CURRENT_DATE + INTERVAL '90 days'
          AND end_date >= CURRENT_DATE
      )::text AS expiring_90
    FROM leases
    WHERE organization_id = ${organizationId}
      AND status = 'active'
      AND end_date IS NOT NULL
  `);
  const expiringLeases30Days = parseInt(expiringResult.rows[0]?.expiring_30 ?? "0", 10);
  const expiringLeases90Days = parseInt(expiringResult.rows[0]?.expiring_90 ?? "0", 10);

  // Rent collection for current month
  const collectionResult = await db.execute<{
    total_collected: string;
    total_expected: string;
  }>(sql`
    SELECT
      COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0)::text AS total_collected,
      COALESCE(SUM(l.monthly_rent), 0)::text AS total_expected
    FROM leases l
    LEFT JOIN payments p ON p.lease_id = l.id
      AND p.type = 'rent'
      AND date_trunc('month', p.paid_at) = date_trunc('month', CURRENT_DATE)
    WHERE l.organization_id = ${organizationId}
      AND l.status = 'active'
  `);
  const totalCollected = parseFloat(collectionResult.rows[0]?.total_collected ?? "0");
  const totalExpected = parseFloat(collectionResult.rows[0]?.total_expected ?? "0");
  const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

  return {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate,
    monthlyRevenue,
    openMaintenanceRequests,
    expiringLeases30Days,
    expiringLeases90Days,
    totalCollected,
    totalExpected,
    collectionRate,
  };
}

// ── Rent Collection ──────────────────────────────────────────────────

async function getRentCollection(
  organizationId: string
): Promise<RentCollectionUnit[]> {
  const result = await db.execute<{
    unit_number: string;
    tenant_name: string;
    monthly_rent: string;
    amount_paid: string;
    payment_date: string | null;
    payment_method: string | null;
    rent_due_day: string;
  }>(sql`
    SELECT
      u.unit_number,
      (t.first_name || ' ' || t.last_name) AS tenant_name,
      l.monthly_rent::text,
      COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0)::text AS amount_paid,
      MAX(p.paid_at)::text AS payment_date,
      MAX(p.method) AS payment_method,
      l.rent_due_day::text
    FROM leases l
    JOIN units u ON u.id = l.unit_id
    JOIN tenants t ON t.id = l.tenant_id
    LEFT JOIN payments p ON p.lease_id = l.id
      AND p.type = 'rent'
      AND date_trunc('month', p.paid_at) = date_trunc('month', CURRENT_DATE)
    WHERE l.organization_id = ${organizationId}
      AND l.status = 'active'
    GROUP BY u.unit_number, t.first_name, t.last_name, l.monthly_rent, l.rent_due_day
    ORDER BY u.unit_number
  `);

  const today = new Date();
  const currentDay = today.getDate();

  return result.rows.map((row) => {
    const monthlyRent = parseFloat(row.monthly_rent);
    const amountPaid = parseFloat(row.amount_paid);
    const rentDueDay = parseInt(row.rent_due_day, 10);
    const gracePeriod = 5;

    let status: RentCollectionUnit["status"];
    if (amountPaid >= monthlyRent) {
      status = "paid";
    } else if (amountPaid > 0) {
      status = "partial";
    } else if (currentDay > rentDueDay + gracePeriod) {
      status = "overdue";
    } else {
      status = "pending";
    }

    return {
      unitNumber: row.unit_number,
      tenantName: row.tenant_name,
      monthlyRent,
      amountPaid,
      status,
      paymentDate: row.payment_date,
      paymentMethod: row.payment_method,
    };
  });
}

// ── Lease Expiration Timeline ────────────────────────────────────────

async function getLeaseTimeline(
  organizationId: string
): Promise<LeaseExpirationMonth[]> {
  const result = await db.execute<{
    month: string;
    unit_number: string;
    tenant_name: string;
    end_date: string;
  }>(sql`
    SELECT
      to_char(l.end_date, 'YYYY-MM') AS month,
      u.unit_number,
      (t.first_name || ' ' || t.last_name) AS tenant_name,
      l.end_date::text
    FROM leases l
    JOIN units u ON u.id = l.unit_id
    JOIN tenants t ON t.id = l.tenant_id
    WHERE l.organization_id = ${organizationId}
      AND l.status = 'active'
      AND l.end_date IS NOT NULL
      AND l.end_date >= CURRENT_DATE
      AND l.end_date <= CURRENT_DATE + INTERVAL '12 months'
    ORDER BY l.end_date
  `);

  // Group by month
  const monthMap = new Map<
    string,
    { units: { unitNumber: string; tenantName: string; endDate: string }[] }
  >();

  for (const row of result.rows) {
    if (!monthMap.has(row.month)) {
      monthMap.set(row.month, { units: [] });
    }
    monthMap.get(row.month)!.units.push({
      unitNumber: row.unit_number,
      tenantName: row.tenant_name,
      endDate: row.end_date,
    });
  }

  // Build 12-month timeline starting from current month
  const timeline: LeaseExpirationMonth[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const data = monthMap.get(monthKey);
    timeline.push({
      month: monthKey,
      label,
      count: data?.units.length ?? 0,
      units: data?.units ?? [],
    });
  }

  return timeline;
}

// ── Occupancy Breakdown ──────────────────────────────────────────────

const statusColors: Record<string, string> = {
  occupied: "var(--color-chart-2)",
  vacant: "var(--color-chart-1)",
  maintenance: "var(--color-chart-4)",
  reserved: "var(--color-chart-3)",
  not_rentable: "var(--color-chart-5)",
};

async function getOccupancyBreakdown(
  organizationId: string
): Promise<OccupancyBreakdown[]> {
  const result = await db.execute<{
    status: string;
    count: string;
  }>(sql`
    SELECT
      status::text,
      COUNT(*)::text AS count
    FROM units
    WHERE organization_id = ${organizationId}
    GROUP BY status
    ORDER BY count DESC
  `);

  return result.rows.map((row) => ({
    status: row.status,
    count: parseInt(row.count, 10),
    fill: statusColors[row.status] ?? "var(--color-chart-5)",
  }));
}
