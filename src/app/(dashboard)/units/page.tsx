import { requireSession } from "@/lib/auth/session";
import { getUnits, getBuildingsForOrg } from "@/lib/services/units";
import { UnitsClient } from "./units-client";

export default async function UnitsPage() {
  const session = await requireSession();

  const [result, buildings] = await Promise.all([
    getUnits(session.organizationId, {
      page: 1,
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    getBuildingsForOrg(session.organizationId),
  ]);

  return (
    <UnitsClient
      units={result.data}
      totalCount={result.total}
      buildings={buildings}
    />
  );
}
