import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      {/* Tab list skeleton */}
      <div className="flex items-center gap-2 rounded-md border border-brand-border bg-brand-bg-secondary p-1">
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-8 w-32 rounded" />
      </div>

      {/* Content area skeleton */}
      <div className="rounded-lg border border-brand-border bg-brand-card p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="mt-4 h-px w-full" />
          <Skeleton className="h-9 w-48 rounded-md" />
        </div>
      </div>
    </div>
  );
}
