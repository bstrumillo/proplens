import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getLeaseById } from "@/lib/services/leases";
import { LeaseDetailClient } from "./lease-detail-client";

interface LeaseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeaseDetailPage({ params }: LeaseDetailPageProps) {
  const session = await requireSession();
  const { id } = await params;

  const lease = await getLeaseById(session.organizationId, id);

  if (!lease) {
    notFound();
  }

  return <LeaseDetailClient lease={lease} />;
}
