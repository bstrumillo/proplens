import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RecentLease } from "@/lib/services/dashboard";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface RecentLeasesCardProps {
  leases: RecentLease[];
}

export function RecentLeasesCard({ leases }: RecentLeasesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leases</CardTitle>
      </CardHeader>
      <CardContent>
        {leases.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No leases found.
          </p>
        ) : (
          <div className="space-y-0">
            <div className="grid grid-cols-4 gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
              <span>Tenant</span>
              <span>Unit</span>
              <span className="text-right">Rent</span>
              <span className="text-right">Start Date</span>
            </div>
            {leases.map((lease) => (
              <div
                key={lease.id}
                className="grid grid-cols-4 gap-4 border-b py-3 text-sm last:border-b-0"
              >
                <span className="truncate font-medium">{lease.tenantName}</span>
                <span className="text-muted-foreground">{lease.unitNumber}</span>
                <span className="text-right">
                  {formatCurrency(lease.monthlyRent)}
                </span>
                <span className="text-right text-muted-foreground">
                  {formatDate(lease.startDate)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
