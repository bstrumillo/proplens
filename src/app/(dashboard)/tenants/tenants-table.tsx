"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { TenantForm } from "./tenant-form";
import { DeleteTenantDialog } from "./delete-tenant-dialog";
import type { Tenant } from "@/types";

interface TenantsTableProps {
  data: Tenant[];
  totalCount: number;
}

export function TenantsTable({ data, totalCount }: TenantsTableProps) {
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<Tenant | null>(null);

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (tenant) => setEditTenant(tenant),
        onDelete: (tenant) => setDeleteTenant(tenant),
      }),
    []
  );

  return (
    <>
      <DataTable columns={columns} data={data} totalCount={totalCount} />

      {editTenant && (
        <TenantForm
          mode="edit"
          tenant={editTenant}
          open={!!editTenant}
          onOpenChange={(open) => {
            if (!open) setEditTenant(null);
          }}
        />
      )}

      <DeleteTenantDialog
        tenant={deleteTenant}
        open={!!deleteTenant}
        onOpenChange={(open) => {
          if (!open) setDeleteTenant(null);
        }}
      />
    </>
  );
}
