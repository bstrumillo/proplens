import { Building2, DollarSign, Wrench, Clock } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getDashboardKPIs } from "@/lib/services/dashboard";
import { KPICard } from "@/components/dashboard/kpi-card";
import { RecentLeasesCard } from "@/components/dashboard/recent-leases-card";
import { ExpiringLeasesCard } from "@/components/dashboard/expiring-leases-card";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default async function DashboardPage() {
  const session = await requireSession();
  const { kpis, recentLeases, expiringLeases } = await getDashboardKPIs(
    session.organizationId
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={Building2}
          label="Occupancy Rate"
          value={formatPercentage(kpis.occupancyRate)}
          description={`${kpis.occupiedUnits} of ${kpis.totalUnits} units`}
        />
        <KPICard
          icon={DollarSign}
          label="Monthly Revenue"
          value={formatCurrency(kpis.monthlyRevenue)}
          description="From active leases"
        />
        <KPICard
          icon={Wrench}
          label="Open Maintenance"
          value={String(kpis.openMaintenanceRequests)}
          description="Pending requests"
        />
        <KPICard
          icon={Clock}
          label="Expiring Leases"
          value={String(kpis.expiringLeases30Days)}
          description="Within 30 days"
        />
      </div>

      {/* Detail Cards */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <RecentLeasesCard leases={recentLeases} />
        <ExpiringLeasesCard leases={expiringLeases} />
      </div>
    </div>
  );
}
