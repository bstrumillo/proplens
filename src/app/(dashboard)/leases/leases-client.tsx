"use client";

import { useState, useMemo, useTransition } from "react";
import { FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getColumns } from "./columns";
import { LeaseForm } from "./lease-form";
import { deleteLeaseAction } from "@/lib/actions/leases";
import type { LeaseWithDetails } from "@/lib/services/leases";
import type { UnitOption, TenantOption } from "@/lib/services/leases";

interface LeasesClientProps {
  leases: LeaseWithDetails[];
  totalCount: number;
  units: UnitOption[];
  tenants: TenantOption[];
}

export function LeasesClient({
  leases,
  totalCount,
  units,
  tenants,
}: LeasesClientProps) {
  const [editLease, setEditLease] = useState<LeaseWithDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(lease: LeaseWithDetails) {
    if (
      !confirm(
        `Are you sure you want to delete the lease for ${lease.tenantName}? This cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteLeaseAction(lease.id);
      if (result.success) {
        toast.success("Lease deleted successfully");
      } else {
        toast.error(result.error);
      }
    });
  }

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (lease) => setEditLease(lease),
        onDelete: handleDelete,
      }),
     
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Leases" description="Manage lease agreements for your properties.">
        <LeaseForm
          mode="create"
          units={units}
          tenants={tenants}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lease
            </Button>
          }
        />
      </PageHeader>

      {leases.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No leases yet"
          description="Get started by adding your first lease agreement."
        >
          <LeaseForm
            mode="create"
            units={units}
            tenants={tenants}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Lease
              </Button>
            }
          />
        </EmptyState>
      ) : (
        <DataTable columns={columns} data={leases} totalCount={totalCount} />
      )}

      {editLease && (
        <LeaseForm
          mode="edit"
          lease={editLease}
          units={units}
          tenants={tenants}
          open={!!editLease}
          onOpenChange={(open) => {
            if (!open) setEditLease(null);
          }}
        />
      )}
    </div>
  );
}
