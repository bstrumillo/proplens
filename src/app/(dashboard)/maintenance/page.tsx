import { Wrench } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import {
  getMaintenanceRequests,
  getUnitsForSelect,
  getTenantsForSelect,
} from "@/lib/services/maintenance";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MaintenanceClient } from "./maintenance-client";
import { RequestForm } from "./request-form";

interface MaintenancePageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    status?: string;
    priority?: string;
    category?: string;
  }>;
}

export default async function MaintenancePage({
  searchParams,
}: MaintenancePageProps) {
  const session = await requireSession();
  const params = await searchParams;

  const [result, unitOptions, tenantOptions] = await Promise.all([
    getMaintenanceRequests(session.organizationId, {
      page: params.page ? Number(params.page) : 1,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: (params.sortOrder as "asc" | "desc") ?? "desc",
      filters: {
        status: params.status,
        priority: params.priority,
        category: params.category,
      },
    }),
    getUnitsForSelect(session.organizationId),
    getTenantsForSelect(session.organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Requests"
        description="Track and manage maintenance requests across your properties."
      >
        <RequestForm
          mode="create"
          unitOptions={unitOptions}
          tenantOptions={tenantOptions}
          trigger={<Button>New Request</Button>}
        />
      </PageHeader>

      {result.data.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No maintenance requests yet"
          description="Create your first maintenance request to get started."
        >
          <RequestForm
            mode="create"
            unitOptions={unitOptions}
            tenantOptions={tenantOptions}
            trigger={<Button>New Request</Button>}
          />
        </EmptyState>
      ) : (
        <MaintenanceClient
          data={result.data}
          totalCount={result.total}
          unitOptions={unitOptions}
          tenantOptions={tenantOptions}
        />
      )}
    </div>
  );
}
