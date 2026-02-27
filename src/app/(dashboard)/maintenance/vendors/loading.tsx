import { TableSkeleton } from "@/components/ui/loading-skeleton";

export default function VendorsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          <div className="mt-1 h-5 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-md bg-muted" />
      </div>
      <TableSkeleton rows={10} />
    </div>
  );
}
