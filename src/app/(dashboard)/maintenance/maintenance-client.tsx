"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { RequestForm } from "./request-form";
import { DeleteRequestDialog } from "./delete-request-dialog";
import type { MaintenanceRequestWithRelations } from "@/lib/services/maintenance";

interface MaintenanceClientProps {
  data: MaintenanceRequestWithRelations[];
  totalCount: number;
  unitOptions: { id: string; unitNumber: string }[];
  tenantOptions: { id: string; name: string }[];
}

export function MaintenanceClient({
  data,
  totalCount,
  unitOptions,
  tenantOptions,
}: MaintenanceClientProps) {
  const [editRequest, setEditRequest] =
    useState<MaintenanceRequestWithRelations | null>(null);
  const [deleteRequest, setDeleteRequest] =
    useState<MaintenanceRequestWithRelations | null>(null);

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (request) => setEditRequest(request),
        onDelete: (request) => setDeleteRequest(request),
      }),
    []
  );

  return (
    <>
      <DataTable columns={columns} data={data} totalCount={totalCount} />

      {editRequest && (
        <RequestForm
          mode="edit"
          request={editRequest}
          unitOptions={unitOptions}
          tenantOptions={tenantOptions}
          open={!!editRequest}
          onOpenChange={(open) => {
            if (!open) setEditRequest(null);
          }}
        />
      )}

      <DeleteRequestDialog
        request={deleteRequest}
        open={!!deleteRequest}
        onOpenChange={(open) => {
          if (!open) setDeleteRequest(null);
        }}
      />
    </>
  );
}
