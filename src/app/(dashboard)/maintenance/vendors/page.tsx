import { HardHat } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getVendors } from "@/lib/services/vendors";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { VendorsClient } from "./vendors-client";
import { VendorForm } from "./vendor-form";

interface VendorsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function VendorsPage({ searchParams }: VendorsPageProps) {
  const session = await requireSession();
  const params = await searchParams;

  const result = await getVendors(session.organizationId, {
    page: params.page ? Number(params.page) : 1,
    search: params.search,
    sortBy: params.sortBy,
    sortOrder: (params.sortOrder as "asc" | "desc") ?? "desc",
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Vendors" description="Manage your vendors and service providers.">
        <VendorForm
          mode="create"
          trigger={<Button>Add Vendor</Button>}
        />
      </PageHeader>

      {result.data.length === 0 ? (
        <EmptyState
          icon={HardHat}
          title="No vendors yet"
          description="Get started by adding your first vendor."
        >
          <VendorForm
            mode="create"
            trigger={<Button>Add Vendor</Button>}
          />
        </EmptyState>
      ) : (
        <VendorsClient data={result.data} totalCount={result.total} />
      )}
    </div>
  );
}
