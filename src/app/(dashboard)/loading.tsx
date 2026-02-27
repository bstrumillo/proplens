import { DashboardSkeleton } from "@/components/ui/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
      <DashboardSkeleton />
    </div>
  );
}
