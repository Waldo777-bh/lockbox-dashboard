"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Plus,
  Box,
  Crown,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const searchParams = useSearchParams();
  const router = useRouter();

  const [vaults, setVaults] = useState<VaultSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("lastModified");
  const [hasMetadata, setHasMetadata] = useState(false);

  // Create vault dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tier, setTier] = useState<string | null>(null);
  const [vaultName, setVaultName] = useState("");
  const [vaultDescription, setVaultDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch tier info
  useEffect(() => {
    fetch("/api/user/tier")
      .then((r) => r.json())
      .then((data) => setTier(data.tier ?? "free"))
      .catch(() => setTier("free"));
  }, []);

  // Open dialog if ?create=true
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setDialogOpen(true);
      // Clean up URL
      router.replace("/dashboard/vaults", { scroll: false });
    }
  }, [searchParams, router]);

  const isPro = tier === "pro";

  const handleCreateVault = async () => {
    if (!vaultName.trim()) return;
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/vaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vaultName.trim(),
          description: vaultDescription.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.code === "TIER_LIMIT") {
          setCreateError(data.error);
          return;
        }
        throw new Error(data.error || "Failed to create vault");
      }

      // Success — close dialog, reset form, refresh list
      setDialogOpen(false);
      setVaultName("");
      setVaultDescription("");
      fetchSummary();
    } catch (err: any) {
      setCreateError(err.message || "Failed to create vault");
    } finally {
      setCreating(false);
    }
  };

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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-text">Vaults</h2>
            <p className="mt-1 text-brand-text-secondary">
              Summary of your encrypted key vaults
            </p>
          </div>
          {isPro && (
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="bg-brand-accent text-brand-bg hover:bg-brand-accent-dim"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Vault
            </Button>
          )}
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

        {/* Create Vault Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setVaultName("");
            setVaultDescription("");
            setCreateError(null);
          }
        }}>
          <DialogContent className="sm:max-w-md">
            {tier === null ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-brand-text-muted" />
              </div>
            ) : isPro ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-brand-text">
                    <Box className="h-5 w-5 text-brand-accent" />
                    Create Vault
                  </DialogTitle>
                  <DialogDescription>
                    Create a new encrypted vault to organize your API keys.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="vault-name" className="text-brand-text-secondary">
                      Vault Name
                    </Label>
                    <Input
                      id="vault-name"
                      placeholder="e.g. Production, Staging, Personal"
                      value={vaultName}
                      onChange={(e) => setVaultName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && vaultName.trim()) {
                          handleCreateVault();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vault-desc" className="text-brand-text-secondary">
                      Description{" "}
                      <span className="text-brand-text-muted font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="vault-desc"
                      placeholder="What is this vault for?"
                      value={vaultDescription}
                      onChange={(e) => setVaultDescription(e.target.value)}
                    />
                  </div>

                  {createError && (
                    <p className="text-sm text-red-400">{createError}</p>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateVault}
                    disabled={!vaultName.trim() || creating}
                    className="bg-brand-accent text-brand-bg hover:bg-brand-accent-dim"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Vault
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              /* Free tier — upgrade prompt */
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-brand-text">
                    <Crown className="h-5 w-5 text-amber-400" />
                    Pro Feature
                  </DialogTitle>
                  <DialogDescription>
                    Creating additional vaults requires a Pro subscription.
                  </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                  <div
                    className="rounded-xl px-4 py-4 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,165,0,0.05))",
                      border: "1px solid rgba(255,215,0,0.15)",
                    }}
                  >
                    <Crown className="h-8 w-8 mx-auto mb-2 text-amber-400" />
                    <p className="text-sm font-semibold text-brand-text mb-1">
                      Unlock Unlimited Vaults
                    </p>
                    <p className="text-xs text-brand-text-muted">
                      Free accounts are limited to 1 vault. Upgrade to Pro for
                      unlimited vaults, team sharing, and more.
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Maybe Later
                  </Button>
                  <Button asChild className="bg-amber-500 text-brand-bg hover:bg-amber-400">
                    <Link href="/dashboard/pricing">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Upgrade to Pro
                    </Link>
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
