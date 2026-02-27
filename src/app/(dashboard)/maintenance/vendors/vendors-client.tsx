"use client";

import { useState, useMemo } from "react";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import { VendorForm } from "./vendor-form";
import { DeleteVendorDialog } from "./delete-vendor-dialog";
import type { Vendor } from "@/types";

interface VendorsClientProps {
  data: Vendor[];
  totalCount: number;
}

export function VendorsClient({ data, totalCount }: VendorsClientProps) {
  const [editVendor, setEditVendor] = useState<Vendor | null>(null);
  const [deleteVendor, setDeleteVendor] = useState<Vendor | null>(null);

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (vendor) => setEditVendor(vendor),
        onDelete: (vendor) => setDeleteVendor(vendor),
      }),
    []
  );

  return (
    <>
      <DataTable columns={columns} data={data} totalCount={totalCount} />

      {editVendor && (
        <VendorForm
          mode="edit"
          vendor={editVendor}
          open={!!editVendor}
          onOpenChange={(open) => {
            if (!open) setEditVendor(null);
          }}
        />
      )}

      <DeleteVendorDialog
        vendor={deleteVendor}
        open={!!deleteVendor}
        onOpenChange={(open) => {
          if (!open) setDeleteVendor(null);
        }}
      />
    </>
  );
}
