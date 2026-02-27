import { Users } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getTenants } from "@/lib/services/tenants";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { TenantsTable } from "./tenants-table";
import { TenantForm } from "./tenant-form";

interface TenantsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function TenantsPage({ searchParams }: TenantsPageProps) {
  const session = await requireSession();
  const params = await searchParams;

  const result = await getTenants(session.organizationId, {
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder as "asc" | "desc") ?? "desc",
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Tenants" description="Manage your tenants and their information.">
        <TenantForm
          mode="create"
          trigger={<Button>Add Tenant</Button>}
        />
      </PageHeader>

      {result.data.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No tenants yet"
          description="Get started by adding your first tenant."
        >
          <TenantForm
            mode="create"
            trigger={<Button>Add Tenant</Button>}
          />
        </EmptyState>
      ) : (
        <TenantsTable data={result.data} totalCount={result.total} />
      )}
    </div>
  );
}
