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
import type { PropertyWithBuildingCount } from "@/lib/services/properties";

const propertyTypeBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  residential: "default",
  commercial: "secondary",
  mixed_use: "outline",
  industrial: "destructive",
};

const propertyTypeLabels: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  mixed_use: "Mixed Use",
  industrial: "Industrial",
};

const statusBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  under_renovation: "outline",
  for_sale: "outline",
};

const statusLabels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  under_renovation: "Under Renovation",
  for_sale: "For Sale",
};

export function getColumns({
  onEdit,
  onDelete,
}: {
  onEdit: (property: PropertyWithBuildingCount) => void;
  onDelete: (property: PropertyWithBuildingCount) => void;
}): ColumnDef<PropertyWithBuildingCount>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <Link
          href={`/properties/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.getValue("name")}
        </Link>
      ),
    },
    {
      id: "address",
      header: "Address",
      cell: ({ row }) => {
        const { city, state } = row.original;
        return (
          <span className="text-muted-foreground">
            {city}, {state}
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
          <Badge variant={propertyTypeBadgeVariant[type] ?? "default"}>
            {propertyTypeLabels[type] ?? type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "buildingCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Buildings" />
      ),
      cell: ({ row }) => {
        return <span>{row.original.buildingCount}</span>;
      },
    },
    {
      accessorKey: "totalUnits",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Units" />
      ),
      cell: ({ row }) => {
        return <span>{row.getValue("totalUnits")}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge variant={statusBadgeVariant[status] ?? "secondary"}>
            {statusLabels[status] ?? status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const property = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(property)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(property)}
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
