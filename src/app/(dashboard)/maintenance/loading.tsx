import { TableSkeleton } from "@/components/ui/loading-skeleton";

export default function MaintenanceLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="bg-muted animate-pulse rounded-md h-9 w-64" />
          <div className="bg-muted animate-pulse rounded-md h-4 w-96 mt-2" />
        </div>
        <div className="bg-muted animate-pulse rounded-md h-10 w-32" />
      </div>
      <TableSkeleton rows={8} />
    </div>
  );
}
