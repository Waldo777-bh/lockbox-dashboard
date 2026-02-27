import { Skeleton } from "@/components/ui/skeleton";

export default function VaultDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Skeleton className="h-5 w-48" />

      {/* Header */}
      <div className="rounded-lg border border-brand-border bg-brand-card p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-lg border border-brand-border bg-brand-card">
        {/* Table header */}
        <div className="flex items-center gap-4 border-b border-brand-border px-6 py-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-brand-border px-6 py-4 last:border-0"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
