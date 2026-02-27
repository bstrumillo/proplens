import { requireSession } from "@/lib/auth/session";
import {
  getLeases,
  getUnitsForDropdown,
  getTenantsForDropdown,
} from "@/lib/services/leases";
import { LeasesClient } from "./leases-client";

export default async function LeasesPage() {
  const session = await requireSession();

  const [leasesResult, units, tenants] = await Promise.all([
    getLeases(session.organizationId, {
      page: 1,
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    getUnitsForDropdown(session.organizationId),
    getTenantsForDropdown(session.organizationId),
  ]);

  return (
    <LeasesClient
      leases={leasesResult.data}
      totalCount={leasesResult.total}
      units={units}
      tenants={tenants}
    />
  );
}
