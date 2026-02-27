"use client";

import { TenantForm } from "../tenant-form";
import { Button } from "@/components/ui/button";
import type { Tenant } from "@/types";

interface TenantDetailActionsProps {
  tenant: Tenant;
}

export function TenantDetailActions({ tenant }: TenantDetailActionsProps) {
  return (
    <TenantForm
      mode="edit"
      tenant={tenant}
      trigger={<Button variant="outline">Edit Tenant</Button>}
    />
  );
}
