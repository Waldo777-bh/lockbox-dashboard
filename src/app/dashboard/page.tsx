"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Monitor,
  Download,
  Terminal,
  ArrowRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SyncStatusBanner } from "@/components/dashboard/sync-status-banner";
import { PortfolioStats } from "@/components/dashboard/portfolio-stats";
import { ServiceCard } from "@/components/dashboard/service-card";
import { VaultSummaryCard } from "@/components/dashboard/vault-summary-card";
import { DashboardSecurityScore } from "@/components/dashboard/dashboard-security-score";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// --- Types matching GET /api/dashboard/summary ---

interface SyncData {
  isSynced: boolean;
  lastSyncedAt: string | null;
  version: number;
  hasExtensionToken: boolean;
}

interface VaultData {
  id: string;
  name: string;
  keyCount: number;
  services: string[];
  lastModified: string;
}

interface ServiceData {
  name: string;
  keyCount: number;
  keyNames: string[];
}

interface MetadataData {
  vaultCount: number;
  totalKeys: number;
  vaults: VaultData[];
  services: ServiceData[];
  lastModified: string;
}

interface ActivityEntry {
  id: string;
  action: string;
  service: string | null;
  keyName: string | null;
  vaultName: string | null;
  source: string | null;
  createdAt: string;
}

interface DashboardSummary {
  sync: SyncData;
  metadata: MetadataData | null;
  recentActivity: ActivityEntry[];
}

// --- Activity helpers ---

function getActivityDotColor(action: string): string {
  if (action.includes("CREAT") || action.includes("ADD")) return "bg-brand-accent";
  if (action.includes("ACCESS") || action.includes("DECRYPT")) return "bg-brand-blue";
  if (action.includes("UPDATE")) return "bg-brand-warning";
  if (action.includes("DELETE") || action.includes("REVOK")) return "bg-brand-danger";
  return "bg-brand-text-muted";
}

function getActivityBadgeVariant(
  action: string
): "default" | "blue" | "warning" | "destructive" | "secondary" {
  if (action.includes("CREAT") || action.includes("ADD")) return "default";
  if (action.includes("ACCESS") || action.includes("DECRYPT")) return "blue";
  if (action.includes("UPDATE")) return "warning";
  if (action.includes("DELETE") || action.includes("REVOK")) return "destructive";
  return "secondary";
}

function getSourceBadge(source: string | null) {
  if (!source) return null;
  const lower = source.toLowerCase();
  if (lower.includes("extension")) return { label: "Extension", variant: "purple" as const };
  if (lower.includes("cli")) return { label: "CLI", variant: "blue" as const };
  if (lower.includes("dashboard") || lower.includes("web")) return { label: "Dashboard", variant: "secondary" as const };
  return { label: source, variant: "secondary" as const };
}

// --- Stagger animation variants ---

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

// --- Loading skeleton ---

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Banner skeleton */}
      <Skeleton className="h-16 w-full rounded-lg" />

      {/* Hero stats skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
        <div className="flex gap-3">
          <Skeleton className="h-16 w-32 rounded-lg" />
          <Skeleton className="h-16 w-32 rounded-lg" />
          <Skeleton className="h-16 w-32 rounded-lg" />
        </div>
      </div>

      {/* Services skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40 rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
          <Skeleton className="h-28 rounded-lg" />
        </div>
      </div>

      {/* Vaults skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-32 rounded" />
        <div className="flex gap-4">
          <Skeleton className="h-36 w-72 shrink-0 rounded-lg" />
          <Skeleton className="h-36 w-72 shrink-0 rounded-lg" />
        </div>
      </div>

      {/* Activity skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-36 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

// --- Main page ---

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/dashboard/summary");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json: DashboardSummary = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-brand-danger">{error ?? "No data available"}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 text-sm text-brand-accent hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  const { sync, metadata, recentActivity } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8"
    >
      {/* A. Sync Status Banner */}
      <SyncStatusBanner
        isSynced={sync.isSynced}
        lastSyncedAt={sync.lastSyncedAt}
        vaultCount={metadata?.vaultCount ?? 0}
        totalKeys={metadata?.totalKeys ?? 0}
        hasExtensionToken={sync.hasExtensionToken}
      />

      {/* B. Portfolio Hero Stats */}
      {metadata ? (
        <PortfolioStats
          totalKeys={metadata.totalKeys}
          vaultCount={metadata.vaultCount}
          lastSyncedAt={sync.lastSyncedAt}
        />
      ) : (
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
            Your Lockbox is empty
          </h1>
          <p className="text-sm text-brand-text-secondary">
            Connect the browser extension and sync your wallet to see your keys
            here.
          </p>
        </div>
      )}

      {/* C. Service Breakdown + Security Score */}
      {metadata && metadata.services.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-brand-text-secondary">
            Services ({metadata.services.length})
          </h2>
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            {/* Service cards grid */}
            <motion.div
              className="grid gap-4 sm:grid-cols-2"
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {metadata.services.map((svc) => (
                <motion.div key={svc.name} variants={staggerItem}>
                  <ServiceCard
                    name={svc.name}
                    keyCount={svc.keyCount}
                    keyNames={svc.keyNames}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Security score sidebar */}
            <div className="hidden lg:block">
              <DashboardSecurityScore
                isSynced={sync.isSynced}
                metadata={metadata}
              />
            </div>
          </div>

          {/* Security score below on mobile */}
          <div className="lg:hidden">
            <DashboardSecurityScore
              isSynced={sync.isSynced}
              metadata={metadata}
            />
          </div>
        </div>
      )}

      {/* D. Vault Summary Cards */}
      {metadata && metadata.vaults.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-brand-text-secondary">
            Vaults ({metadata.vaults.length})
          </h2>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-thin">
            {metadata.vaults.map((vault, i) => (
              <motion.div
                key={vault.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
              >
                <VaultSummaryCard
                  name={vault.name}
                  keyCount={vault.keyCount}
                  services={vault.services}
                  lastModified={vault.lastModified}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* E. Recent Activity Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-brand-text-secondary">
            Recent Activity
          </h2>
          {recentActivity.length > 0 && (
            <Link
              href="/dashboard/audit"
              className="inline-flex items-center gap-1 text-xs text-brand-text-muted transition-colors hover:text-brand-accent"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {recentActivity.length === 0 ? (
          <div className="rounded-lg border border-brand-border bg-brand-card p-6 text-center">
            <p className="text-sm text-brand-text-muted">
              No activity recorded yet. Actions from the extension, CLI, and
              dashboard will appear here.
            </p>
          </div>
        ) : (
          <motion.div
            className="space-y-0"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {recentActivity.slice(0, 10).map((entry) => {
              const dotColor = getActivityDotColor(entry.action);
              const badgeVariant = getActivityBadgeVariant(entry.action);
              const sourceBadge = getSourceBadge(entry.source);

              return (
                <motion.div
                  key={entry.id}
                  variants={staggerItem}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-brand-card"
                >
                  {/* Dot */}
                  <div
                    className={cn("h-2 w-2 shrink-0 rounded-full", dotColor)}
                  />

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Badge variant={badgeVariant} className="shrink-0 text-[10px]">
                        {entry.action.replace(/_/g, " ")}
                      </Badge>
                      <span className="hidden truncate font-mono text-xs text-brand-text-secondary sm:inline">
                        {entry.service && entry.keyName
                          ? `${entry.service}/${entry.keyName}`
                          : entry.keyName ?? entry.service ?? ""}
                      </span>
                      {entry.vaultName && (
                        <span className="hidden text-xs text-brand-text-muted lg:inline">
                          in {entry.vaultName}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {sourceBadge && (
                        <Badge
                          variant={sourceBadge.variant}
                          className="hidden text-[10px] sm:inline-flex"
                        >
                          {sourceBadge.label}
                        </Badge>
                      )}
                      <span className="text-xs tabular-nums text-brand-text-muted">
                        {formatDistanceToNow(new Date(entry.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* F. Quick Actions Row */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-brand-text-secondary">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Open Extension */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-default items-center gap-3 rounded-lg border border-brand-border bg-brand-card p-4 transition-colors hover:border-brand-border-bright">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
                    <Monitor className="h-5 w-5 text-brand-accent" />
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-brand-text">
                      Open Extension
                      <Info className="h-3 w-3 text-brand-text-muted" />
                    </p>
                    <p className="text-xs text-brand-text-muted">
                      Use the browser toolbar icon
                    </p>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click the Lockbox icon in your browser toolbar to open the extension</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Download Extension */}
          <Link
            href="/dashboard/extension-setup"
            className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-card p-4 transition-all hover:border-brand-border-bright hover:shadow-[0_0_20px_rgba(34,214,138,0.06)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-purple/10">
              <Download className="h-5 w-5 text-brand-purple" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-text">
                Download Extension
              </p>
              <p className="text-xs text-brand-text-muted">
                Set up Lockbox in your browser
              </p>
            </div>
          </Link>

          {/* CLI Setup */}
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-card p-4 transition-all hover:border-brand-border-bright hover:shadow-[0_0_20px_rgba(34,214,138,0.06)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10">
              <Terminal className="h-5 w-5 text-brand-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-text">CLI Setup</p>
              <p className="text-xs text-brand-text-muted">
                Access keys from your terminal
              </p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
