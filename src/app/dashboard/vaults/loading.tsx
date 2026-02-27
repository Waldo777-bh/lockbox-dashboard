import { Skeleton } from "@/components/ui/skeleton";

export default function VaultsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>

      {/* 3x3 grid of card skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
