import { requireSession } from "@/lib/auth/session";
import { getProperties } from "@/lib/services/properties";
import { PropertiesClient } from "./properties-client";

export default async function PropertiesPage() {
  const session = await requireSession();

  const result = await getProperties(session.organizationId, {
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  return (
    <PropertiesClient
      properties={result.data}
      totalCount={result.total}
    />
  );
}
