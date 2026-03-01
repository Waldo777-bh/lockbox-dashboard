"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Lock,
  Search,
  ArrowUpDown,
  Info,
  Loader2,
  RefreshCw,
  Puzzle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from "@/components/layout/page-transition";

interface VaultSummary {
  name: string;
  keyCount: number;
  services: string[];
  lastModified: string;
}

interface SummaryData {
  metadata?: {
    vaults?: VaultSummary[];
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export default function VaultsPage() {
  const [vaults, setVaults] = useState<VaultSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("lastModified");
  const [hasMetadata, setHasMetadata] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data: SummaryData = await res.json();

      if (data.metadata?.vaults) {
        setVaults(data.metadata.vaults);
        setHasMetadata(true);
      } else {
        setVaults([]);
        setHasMetadata(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load vault summaries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Filter and sort
  const filteredVaults = vaults
    .filter((v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.services.some((s) => s.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "keyCount":
          return b.keyCount - a.keyCount;
        case "lastModified":
        default:
          return (
            new Date(b.lastModified).getTime() -
            new Date(a.lastModified).getTime()
          );
      }
    });

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Vaults</h2>
          <p className="mt-1 text-brand-text-secondary">
            Summary of your encrypted key vaults
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-4">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-accent" />
          <p className="text-sm text-brand-text-secondary">
            Keys are managed in the Lockbox extension. This page shows a
            summary of your vaults.
          </p>
        </div>

        {/* Toolbar */}
        {hasMetadata && vaults.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
              <Input
                placeholder="Search vaults or services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <ArrowUpDown className="mr-2 h-3 w-3" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lastModified">Last Modified</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="keyCount">Key Count</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-brand-border bg-brand-card p-5"
              >
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <Lock className="h-6 w-6 text-red-400" />
              </div>
              <CardTitle className="text-brand-text-secondary">
                Failed to load vaults
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-sm text-brand-text-muted">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchSummary}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : !hasMetadata ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10">
                <Puzzle className="h-6 w-6 text-brand-accent" />
              </div>
              <CardTitle className="text-brand-text-secondary">
                No vault data available
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-brand-text-muted">
                Connect your Lockbox extension to see vault summaries.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                asChild
              >
                <a href="/dashboard/extension-setup">
                  View Setup Guide
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : filteredVaults.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10">
                <Lock className="h-6 w-6 text-brand-accent" />
              </div>
              <CardTitle className="text-brand-text-secondary">
                {search ? "No vaults found" : "No vaults yet"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-brand-text-muted">
                {search
                  ? "Try a different search term or clear the filter."
                  : "Create your first vault in the Lockbox extension to see it here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredVaults.map((vault) => (
              <motion.div
                key={vault.name}
                variants={cardVariants}
                className="rounded-lg border border-brand-border bg-brand-card p-5 transition-colors hover:bg-brand-card-hover"
              >
                {/* Vault name + key count */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent/10">
                      <Lock className="h-4 w-4 text-brand-accent" />
                    </div>
                    <h3 className="font-semibold text-brand-text">
                      {vault.name}
                    </h3>
                  </div>
                  <Badge variant="secondary">
                    {vault.keyCount} {vault.keyCount === 1 ? "key" : "keys"}
                  </Badge>
                </div>

                {/* Services list */}
                {vault.services.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {vault.services.slice(0, 5).map((service) => (
                      <Badge
                        key={service}
                        variant="outline"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                    {vault.services.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{vault.services.length - 5} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Last modified */}
                <p className="text-xs text-brand-text-muted">
                  Updated{" "}
                  {formatDistanceToNow(new Date(vault.lastModified), {
                    addSuffix: true,
                  })}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
