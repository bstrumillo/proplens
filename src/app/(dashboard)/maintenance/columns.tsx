"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import type { MaintenanceRequestWithRelations } from "@/lib/services/maintenance";

interface ColumnActions {
  onEdit: (request: MaintenanceRequestWithRelations) => void;
  onDelete: (request: MaintenanceRequestWithRelations) => void;
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string }> = {
    emergency: {
      label: "Emergency",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
    urgent: {
      label: "Urgent",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
    high: {
      label: "High",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    medium: {
      label: "Medium",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
    low: {
      label: "Low",
      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
  };

  const { label, className } = config[priority] ?? {
    label: priority,
    className: "",
  };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    submitted: {
      label: "Submitted",
      className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    },
    acknowledged: {
      label: "Acknowledged",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    in_progress: {
      label: "In Progress",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    on_hold: {
      label: "On Hold",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
    completed: {
      label: "Completed",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    closed: {
      label: "Closed",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "",
  };

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

export function getColumns(
  actions: ColumnActions
): ColumnDef<MaintenanceRequestWithRelations>[] {
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const request = row.original;
        return (
          <Link
            href={`/maintenance/${request.id}`}
            className="font-medium text-primary hover:underline"
          >
            {request.title}
          </Link>
        );
      },
    },
    {
      accessorKey: "unitNumber",
      header: "Unit",
      cell: ({ row }) => row.original.unitNumber ?? "-",
    },
    {
      accessorKey: "tenantName",
      header: "Tenant",
      cell: ({ row }) => row.original.tenantName ?? "-",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return category
          ? category.charAt(0).toUpperCase() + category.slice(1)
          : "-";
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return date
          ? new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onEdit(request)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDelete(request)}
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

export { PriorityBadge, StatusBadge };
