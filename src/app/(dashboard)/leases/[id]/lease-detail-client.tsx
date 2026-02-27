"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Home,
  User,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateLeaseAction, deleteLeaseAction } from "@/lib/actions/leases";
import { leaseStatusValues } from "@/lib/validators/leases";
import type { LeaseWithDetails } from "@/lib/services/leases";

// ── Status badge styling ─────────────────────────────────────────────

const statusBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "secondary",
  active: "default",
  expired: "outline",
  terminated: "destructive",
  renewed: "secondary",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  expired: "Expired",
  terminated: "Terminated",
  renewed: "Renewed",
};

const typeLabels: Record<string, string> = {
  fixed: "Fixed",
  month_to_month: "Month-to-Month",
  corporate: "Corporate",
  student: "Student",
  section8: "Section 8",
};

// ── Formatters ───────────────────────────────────────────────────────

function formatCurrency(value: string | null | undefined): string {
  if (!value) return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const dateStr = typeof value === "string" ? value : value.toISOString();
  return new Date(dateStr.split("T")[0] + "T00:00:00").toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

// ── Component ────────────────────────────────────────────────────────

interface LeaseDetailClientProps {
  lease: LeaseWithDetails;
}

export function LeaseDetailClient({ lease }: LeaseDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(lease.status);

  function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("status", newStatus);

      const result = await updateLeaseAction(lease.id, formData);
      if (result.success) {
        setCurrentStatus(newStatus as typeof currentStatus);
        toast.success(`Lease status updated to ${statusLabels[newStatus]}`);
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete() {
    if (
      !confirm(
        `Are you sure you want to delete this lease for ${lease.tenantName}? This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteLeaseAction(lease.id);
      if (result.success) {
        toast.success("Lease deleted successfully");
        router.push("/leases");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/leases">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">
                Lease - {lease.tenantName}
              </h1>
              <Badge
                variant={statusBadgeVariant[currentStatus] ?? "secondary"}
                className={
                  currentStatus === "active"
                    ? "bg-green-600 text-white"
                    : currentStatus === "expired"
                      ? "bg-yellow-500 text-white"
                      : currentStatus === "renewed"
                        ? "bg-blue-500 text-white"
                        : undefined
                }
              >
                {statusLabels[currentStatus] ?? currentStatus}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Unit {lease.unitNumber} at {lease.buildingName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select
              value={currentStatus}
              onValueChange={handleStatusChange}
              disabled={isPending}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leaseStatusValues.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Lease Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Lease Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">
                  {typeLabels[lease.type] ?? lease.type}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Auto-Renew</p>
                <p className="font-medium">
                  {lease.autoRenew ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{formatDate(lease.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{formatDate(lease.endDate)}</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Signed by Tenant
                </p>
                <p className="font-medium">
                  {formatDate(lease.signedByTenant)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Signed by Manager
                </p>
                <p className="font-medium">
                  {formatDate(lease.signedByManager)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                <p className="text-xl font-bold">
                  {formatCurrency(lease.monthlyRent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Security Deposit
                </p>
                <p className="font-medium">
                  {formatCurrency(lease.securityDeposit)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pet Deposit</p>
                <p className="font-medium">
                  {formatCurrency(lease.petDeposit)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Furnished Premium
                </p>
                <p className="font-medium">
                  {formatCurrency(lease.furnishedPremium)}
                </p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Rent Due Day</p>
                <p className="font-medium">{lease.rentDueDay}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Late Fee</p>
                <p className="font-medium">
                  {formatCurrency(lease.lateFeeAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grace Days</p>
                <p className="font-medium">{lease.lateFeeGraceDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Tenant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <Link
                href={`/tenants/${lease.tenantId}`}
                className="font-medium text-primary hover:underline"
              >
                {lease.tenantName}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Unit Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Unit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Unit Number</p>
                <p className="font-medium">{lease.unitNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Building</p>
                <p className="font-medium">{lease.buildingName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {lease.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{lease.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
