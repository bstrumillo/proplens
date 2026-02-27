import { TableSkeleton } from "@/components/ui/loading-skeleton";

export default function PropertiesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-1 h-5 w-60 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
