import { Skeleton } from "@/components/ui/skeleton";

export default function AuditLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Timeline entry skeletons */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-brand-border bg-brand-card p-4"
          >
            <Skeleton className="mt-1.5 h-3 w-3 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
