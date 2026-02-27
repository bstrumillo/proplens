import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExpiringLease } from "@/lib/services/dashboard";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function urgencyVariant(
  daysRemaining: number
): "destructive" | "secondary" | "outline" {
  if (daysRemaining <= 7) return "destructive";
  if (daysRemaining <= 14) return "secondary";
  return "outline";
}

interface ExpiringLeasesCardProps {
  leases: ExpiringLease[];
}

export function ExpiringLeasesCard({ leases }: ExpiringLeasesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expiring Leases (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        {leases.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No leases expiring in the next 30 days.
          </p>
        ) : (
          <div className="space-y-0">
            <div className="grid grid-cols-4 gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
              <span>Tenant</span>
              <span>Unit</span>
              <span className="text-right">End Date</span>
              <span className="text-right">Remaining</span>
            </div>
            {leases.map((lease) => (
              <div
                key={lease.id}
                className="grid grid-cols-4 gap-4 border-b py-3 text-sm last:border-b-0 items-center"
              >
                <span className="truncate font-medium">{lease.tenantName}</span>
                <span className="text-muted-foreground">{lease.unitNumber}</span>
                <span className="text-right text-muted-foreground">
                  {formatDate(lease.endDate)}
                </span>
                <span className="text-right">
                  <Badge variant={urgencyVariant(lease.daysRemaining)}>
                    {lease.daysRemaining}d
                  </Badge>
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
