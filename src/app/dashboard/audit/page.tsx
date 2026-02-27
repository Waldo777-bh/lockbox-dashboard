"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditTimeline } from "@/components/audit/audit-timeline";
import { AuditFilters } from "@/components/audit/audit-filters";
import { PageTransition } from "@/components/layout/page-transition";

interface AuditLog {
  id: string;
  action: string;
  service?: string | null;
  keyName?: string | null;
  metadata?: any;
  createdAt: string;
}

interface Filters {
  action?: string;
  search?: string;
  since?: string;
}

const PAGE_SIZE = 50;

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [actions, setActions] = useState<string[]>([]);
  const [offset, setOffset] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchLogs = useCallback(
    async (currentOffset: number, append: boolean) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const params = new URLSearchParams();
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", String(currentOffset));
        if (filters.action) params.set("action", filters.action);
        if (filters.search) params.set("search", filters.search);
        if (filters.since) params.set("since", filters.since);

        const res = await fetch(`/api/audit?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        if (append) {
          setLogs((prev) => [...prev, ...data.logs]);
        } else {
          setLogs(data.logs);

          // Extract unique actions for filter dropdown (only on initial load)
          if (data.logs.length > 0) {
            const uniqueActions = Array.from(
              new Set(data.logs.map((l: AuditLog) => l.action))
            ) as string[];
            setActions((prev) =>
              prev.length > 0
                ? Array.from(new Set([...prev, ...uniqueActions]))
                : uniqueActions
            );
          }
        }

        setTotal(data.total);
      } catch {
        // Silently handle — user can retry
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters]
  );

  // Initial fetch and filter changes
  useEffect(() => {
    setOffset(0);
    fetchLogs(0, false);
  }, [fetchLogs]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !loading && !loadingMore && logs.length < total) {
          const newOffset = offset + PAGE_SIZE;
          setOffset(newOffset);
          fetchLogs(newOffset, true);
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, logs.length, total, offset, fetchLogs]);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Audit Log</h2>
          <p className="mt-1 text-brand-text-secondary">
            Track all actions performed on your vaults
          </p>
        </div>

        <AuditFilters onFilterChange={handleFilterChange} actions={actions} />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
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
        ) : logs.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10">
                <ScrollText className="h-6 w-6 text-brand-accent" />
              </div>
              <CardTitle className="text-brand-text-secondary">
                No activity yet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-brand-text-muted">
                Your audit trail will appear here once you start using Lockbox.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <AuditTimeline logs={logs} />

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
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
            )}

            {/* Sentinel for infinite scroll */}
            <div ref={sentinelRef} className="h-1" />

            {/* Count indicator */}
            {logs.length > 0 && (
              <p className="text-center text-sm text-brand-text-muted">
                Showing {logs.length} of {total} entries
              </p>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
