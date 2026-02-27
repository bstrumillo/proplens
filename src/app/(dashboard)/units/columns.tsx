"use client";

import { type ColumnDef } from "@tanstack/react-table";
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
import type { UnitWithBuilding } from "@/lib/services/units";

const unitTypeLabels: Record<string, string> = {
  apartment: "Apartment",
  studio: "Studio",
  townhouse: "Townhouse",
  condo: "Condo",
  commercial: "Commercial",
  storage: "Storage",
};

const unitTypeBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  apartment: "default",
  studio: "secondary",
  townhouse: "outline",
  condo: "default",
  commercial: "secondary",
  storage: "outline",
};

const statusLabels: Record<string, string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  maintenance: "Maintenance",
  reserved: "Reserved",
  not_rentable: "Not Rentable",
};

const statusBadgeClasses: Record<string, string> = {
  vacant: "bg-green-100 text-green-800 hover:bg-green-100",
  occupied: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  reserved: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  not_rentable: "bg-red-100 text-red-800 hover:bg-red-100",
};

function formatCurrency(value: string | null): string {
  if (!value) return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

interface ColumnActions {
  onEdit: (unit: UnitWithBuilding) => void;
  onDelete: (unit: UnitWithBuilding) => void;
}

export function getColumns(actions: ColumnActions): ColumnDef<UnitWithBuilding>[] {
  return [
    {
      accessorKey: "unitNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Unit Number" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/units/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue("unitNumber")}
        </Link>
      ),
    },
    {
      id: "building",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Building" />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-muted-foreground">
            {row.original.buildingName}
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
          <Badge variant={unitTypeBadgeVariant[type] ?? "default"}>
            {unitTypeLabels[type] ?? type}
          </Badge>
        );
      },
    },
    {
      id: "bedBath",
      header: "Bed / Bath",
      cell: ({ row }) => {
        const bed = row.original.bedrooms;
        const bath = row.original.bathrooms;
        const bedStr = bed !== null ? `${bed}` : "-";
        const bathStr = bath !== null ? `${bath}` : "-";
        return (
          <span className="text-muted-foreground">
            {bedStr} / {bathStr}
          </span>
        );
      },
    },
    {
      accessorKey: "currentRent",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Rent" />
      ),
      cell: ({ row }) => {
        return formatCurrency(row.original.currentRent);
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant="outline"
            className={statusBadgeClasses[status] ?? ""}
          >
            {statusLabels[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const unit = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onEdit(unit)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(unit)}
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
