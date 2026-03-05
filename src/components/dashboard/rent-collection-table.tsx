"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RentCollectionUnit } from "@/lib/services/dashboard";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMethod(method: string | null): string {
  if (!method) return "—";
  const labels: Record<string, string> = {
    ach: "ACH",
    credit_card: "Card",
    debit_card: "Debit",
    check: "Check",
    cash: "Cash",
    wire: "Wire",
    other: "Other",
  };
  return labels[method] ?? method;
}

const statusConfig: Record<
  RentCollectionUnit["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  paid: { label: "Paid", variant: "default" },
  partial: { label: "Partial", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  overdue: { label: "Overdue", variant: "destructive" },
};

export function RentCollectionTable({
  data,
  totalCollected,
  totalExpected,
  collectionRate,
}: {
  data: RentCollectionUnit[];
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
}) {
  const paidCount = data.filter((d) => d.status === "paid").length;
  const overdueCount = data.filter((d) => d.status === "overdue").length;
  const pendingCount = data.filter(
    (d) => d.status === "pending" || d.status === "partial"
  ).length;

  return (
    <Card variant="glass" className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Rent Collection
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {formatCurrency(totalCollected)} / {formatCurrency(totalExpected)}
            </span>
            <Badge variant={collectionRate >= 90 ? "default" : "destructive"}>
              {collectionRate.toFixed(0)}%
            </Badge>
          </div>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-primary" />
            {paidCount} paid
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-muted-foreground/40" />
            {pendingCount} pending
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-2 rounded-full bg-destructive" />
            {overdueCount} overdue
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Unit</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Method
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((unit) => {
                const cfg = statusConfig[unit.status];
                return (
                  <TableRow key={unit.unitNumber} className="hover:bg-primary/5 transition-colors duration-150">
                    <TableCell className="font-medium">
                      {unit.unitNumber}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {unit.tenantName}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(unit.monthlyRent)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={cfg.variant} className="text-xs">
                        {cfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {unit.amountPaid > 0
                        ? formatCurrency(unit.amountPaid)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatDate(unit.paymentDate)}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      {formatMethod(unit.paymentMethod)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
