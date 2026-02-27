import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

// ── Types ────────────────────────────────────────────────────────────

export interface DashboardKPIs {
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
  openMaintenanceRequests: number;
  expiringLeases30Days: number;
}

export interface RecentLease {
  id: string;
  tenantName: string;
  unitNumber: string;
  monthlyRent: number;
  startDate: string;
}

export interface ExpiringLease {
  id: string;
  tenantName: string;
  unitNumber: string;
  endDate: string;
  daysRemaining: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  recentLeases: RecentLease[];
  expiringLeases: ExpiringLease[];
}

// ── Service ──────────────────────────────────────────────────────────

export async function getDashboardKPIs(
  organizationId: string
): Promise<DashboardData> {
  // Run all queries in parallel for performance
  const [kpiResult, recentLeasesResult, expiringLeasesResult] =
    await Promise.all([
      getKPIs(organizationId),
      getRecentLeases(organizationId),
      getExpiringLeases(organizationId),
    ]);

  return {
    kpis: kpiResult,
    recentLeases: recentLeasesResult,
    expiringLeases: expiringLeasesResult,
  };
}

async function getKPIs(organizationId: string): Promise<DashboardKPIs> {
  // Single query to get unit counts
  const unitStats = await db.execute<{
    total_units: string;
    occupied_units: string;
  }>(sql`
    SELECT
      COUNT(*)::text AS total_units,
      COUNT(*) FILTER (WHERE status = 'occupied')::text AS occupied_units
    FROM units
    WHERE organization_id = ${organizationId}
  `);

  const totalUnits = parseInt(unitStats.rows[0]?.total_units ?? "0", 10);
  const occupiedUnits = parseInt(
    unitStats.rows[0]?.occupied_units ?? "0",
    10
  );
  const occupancyRate =
    totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  // Monthly revenue from active leases
  const revenueResult = await db.execute<{ total_revenue: string }>(sql`
    SELECT COALESCE(SUM(monthly_rent), 0)::text AS total_revenue
    FROM leases
    WHERE organization_id = ${organizationId}
      AND status = 'active'
  `);

  const monthlyRevenue = parseFloat(
    revenueResult.rows[0]?.total_revenue ?? "0"
  );

  // Open maintenance requests (not completed, closed, or cancelled)
  const maintenanceResult = await db.execute<{ open_count: string }>(sql`
    SELECT COUNT(*)::text AS open_count
    FROM maintenance_requests
    WHERE organization_id = ${organizationId}
      AND status NOT IN ('completed', 'closed', 'cancelled')
  `);

  const openMaintenanceRequests = parseInt(
    maintenanceResult.rows[0]?.open_count ?? "0",
    10
  );

  // Leases expiring within 30 days
  const expiringResult = await db.execute<{ expiring_count: string }>(sql`
    SELECT COUNT(*)::text AS expiring_count
    FROM leases
    WHERE organization_id = ${organizationId}
      AND status = 'active'
      AND end_date IS NOT NULL
      AND end_date <= CURRENT_DATE + INTERVAL '30 days'
      AND end_date >= CURRENT_DATE
  `);

  const expiringLeases30Days = parseInt(
    expiringResult.rows[0]?.expiring_count ?? "0",
    10
  );

  return {
    totalUnits,
    occupiedUnits,
    occupancyRate,
    monthlyRevenue,
    openMaintenanceRequests,
    expiringLeases30Days,
  };
}

async function getRecentLeases(
  organizationId: string
): Promise<RecentLease[]> {
  const result = await db.execute<{
    id: string;
    tenant_name: string;
    unit_number: string;
    monthly_rent: string;
    start_date: string;
  }>(sql`
    SELECT
      l.id,
      (t.first_name || ' ' || t.last_name) AS tenant_name,
      u.unit_number,
      l.monthly_rent::text,
      l.start_date::text
    FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    JOIN units u ON u.id = l.unit_id
    WHERE l.organization_id = ${organizationId}
    ORDER BY l.created_at DESC
    LIMIT 5
  `);

  return result.rows.map((row) => ({
    id: row.id,
    tenantName: row.tenant_name,
    unitNumber: row.unit_number,
    monthlyRent: parseFloat(row.monthly_rent),
    startDate: row.start_date,
  }));
}

async function getExpiringLeases(
  organizationId: string
): Promise<ExpiringLease[]> {
  const result = await db.execute<{
    id: string;
    tenant_name: string;
    unit_number: string;
    end_date: string;
    days_remaining: string;
  }>(sql`
    SELECT
      l.id,
      (t.first_name || ' ' || t.last_name) AS tenant_name,
      u.unit_number,
      l.end_date::text,
      (l.end_date - CURRENT_DATE)::text AS days_remaining
    FROM leases l
    JOIN tenants t ON t.id = l.tenant_id
    JOIN units u ON u.id = l.unit_id
    WHERE l.organization_id = ${organizationId}
      AND l.status = 'active'
      AND l.end_date IS NOT NULL
      AND l.end_date <= CURRENT_DATE + INTERVAL '30 days'
      AND l.end_date >= CURRENT_DATE
    ORDER BY l.end_date ASC
    LIMIT 5
  `);

  return result.rows.map((row) => ({
    id: row.id,
    tenantName: row.tenant_name,
    unitNumber: row.unit_number,
    endDate: row.end_date,
    daysRemaining: parseInt(row.days_remaining, 10),
  }));
}
