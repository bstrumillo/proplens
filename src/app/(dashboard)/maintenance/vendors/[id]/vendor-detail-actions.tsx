"use client";

import { VendorForm } from "../vendor-form";
import { Button } from "@/components/ui/button";
import type { Vendor } from "@/types";

interface VendorDetailActionsProps {
  vendor: Vendor;
}

export function VendorDetailActions({ vendor }: VendorDetailActionsProps) {
  return (
    <VendorForm
      mode="edit"
      vendor={vendor}
      trigger={<Button variant="outline">Edit Vendor</Button>}
    />
  );
}
