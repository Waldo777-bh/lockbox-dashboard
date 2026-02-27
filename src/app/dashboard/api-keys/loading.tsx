import { Skeleton } from "@/components/ui/skeleton";

export default function ApiKeysLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </div>

      {/* Warning banner skeleton */}
      <Skeleton className="h-14 w-full rounded-md" />

      {/* Table skeleton */}
      <div className="rounded-lg border border-brand-border bg-brand-card">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-brand-border px-6 py-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-brand-border px-6 py-4 last:border-0"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-28 rounded" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
