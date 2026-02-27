"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import type { LeaseWithDetails } from "@/lib/services/leases";

// ── Badge variants ───────────────────────────────────────────────────

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

const typeBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  fixed: "default",
  month_to_month: "secondary",
  corporate: "outline",
  student: "outline",
  section8: "outline",
};

const typeLabels: Record<string, string> = {
  fixed: "Fixed",
  month_to_month: "Month-to-Month",
  corporate: "Corporate",
  student: "Student",
  section8: "Section 8",
};

// ── Currency formatter ───────────────────────────────────────────────

function formatCurrency(value: string | null | undefined): string {
  if (!value) return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

// ── Date formatter ───────────────────────────────────────────────────

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Columns ──────────────────────────────────────────────────────────

interface ColumnActions {
  onEdit: (lease: LeaseWithDetails) => void;
  onDelete: (lease: LeaseWithDetails) => void;
}

export function getColumns(actions: ColumnActions): ColumnDef<LeaseWithDetails>[] {
  return [
    {
      accessorKey: "tenantName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tenant" />
      ),
      cell: ({ row }) => {
        const lease = row.original;
        return (
          <Link
            href={`/leases/${lease.id}`}
            className="font-medium text-primary hover:underline"
          >
            {lease.tenantName}
          </Link>
        );
      },
    },
    {
      accessorKey: "unitNumber",
      header: "Unit",
      cell: ({ row }) => {
        const lease = row.original;
        return (
          <span className="text-muted-foreground">
            {lease.unitNumber} ({lease.buildingName})
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
          <Badge variant={typeBadgeVariant[type] ?? "outline"}>
            {typeLabels[type] ?? type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "monthlyRent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Monthly Rent" />
      ),
      cell: ({ row }) => formatCurrency(row.getValue("monthlyRent")),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("startDate")),
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue("endDate")),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={statusBadgeVariant[status] ?? "secondary"}
            className={
              status === "active"
                ? "bg-green-600 text-white"
                : status === "expired"
                  ? "bg-yellow-500 text-white"
                  : status === "renewed"
                    ? "bg-blue-500 text-white"
                    : undefined
            }
          >
            {statusLabels[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lease = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onEdit(lease)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(lease)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
