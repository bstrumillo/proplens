import { Building2, DollarSign, Clock, DoorOpen } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/services/dashboard";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RentCollectionTable } from "@/components/dashboard/rent-collection-table";
import { LeaseTimeline } from "@/components/dashboard/lease-timeline";
import { OccupancyChart } from "@/components/dashboard/occupancy-chart";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function DashboardPage() {
  const session = await requireSession();
  const { kpis, rentCollection, leaseTimeline, occupancyBreakdown } =
    await getDashboardData(session.organizationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={Building2}
          label="Occupancy Rate"
          value={`${kpis.occupancyRate.toFixed(0)}%`}
          description={`${kpis.occupiedUnits} of ${kpis.totalUnits} units`}
        />
        <KPICard
          icon={DollarSign}
          label="Rent Collected"
          value={formatCurrency(kpis.totalCollected)}
          description={`${kpis.collectionRate.toFixed(0)}% of ${formatCurrency(kpis.totalExpected)}`}
        />
        <KPICard
          icon={Clock}
          label="Expiring Leases"
          value={String(kpis.expiringLeases90Days)}
          description={`${kpis.expiringLeases30Days} within 30 days`}
        />
        <KPICard
          icon={DoorOpen}
          label="Vacant Units"
          value={String(kpis.vacantUnits)}
          description={`${formatCurrency(kpis.monthlyRevenue)} monthly revenue`}
        />
      </div>

      {/* Rent Collection Table */}
      <RentCollectionTable
        data={rentCollection}
        totalCollected={kpis.totalCollected}
        totalExpected={kpis.totalExpected}
        collectionRate={kpis.collectionRate}
      />

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <LeaseTimeline data={leaseTimeline} />
        <OccupancyChart
          data={occupancyBreakdown}
          occupancyRate={kpis.occupancyRate}
          totalUnits={kpis.totalUnits}
        />
      </div>
    </div>
  );
}
