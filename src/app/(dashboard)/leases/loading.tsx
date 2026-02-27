import { TableSkeleton } from "@/components/ui/loading-skeleton";

export default function LeasesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="bg-muted h-8 w-32 animate-pulse rounded-md" />
          <div className="bg-muted mt-1 h-4 w-48 animate-pulse rounded-md" />
        </div>
        <div className="bg-muted h-10 w-28 animate-pulse rounded-md" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
