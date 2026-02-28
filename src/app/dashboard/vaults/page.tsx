"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock } from "lucide-react";
import { useDataRefresh } from "@/hooks/use-data-refresh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageTransition } from "@/components/layout/page-transition";
import { CreateVaultDialog } from "@/components/vaults/create-vault-dialog";
import { VaultCard } from "@/components/vaults/vault-card";
import { VaultListRow } from "@/components/vaults/vault-list-row";
import { VaultToolbar } from "@/components/vaults/vault-toolbar";
import { Skeleton } from "@/components/ui/skeleton";

interface Vault {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  emoji: string | null;
  _count: { keys: number };
  updatedAt: string;
  createdAt: string;
}

export default function VaultsPage() {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updatedAt");
  const [view, setView] = useState<"grid" | "list">("grid");

  const fetchVaults = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);

      if (sort === "name") {
        params.set("sort", "name");
        params.set("order", "asc");
      } else if (sort === "keyCount") {
        params.set("sort", "keyCount");
        params.set("order", "desc");
      } else {
        params.set("sort", "updatedAt");
        params.set("order", "desc");
      }

      const res = await fetch(`/api/vaults?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch vaults");
      const data = await res.json();
      setVaults(data);
    } catch (error) {
      console.error("Failed to fetch vaults:", error);
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  // Re-fetch when any vault/key mutation occurs
  useDataRefresh(fetchVaults);

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
  }, []);

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handleViewChange = useCallback((newView: "grid" | "list") => {
    setView(newView);
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-text">Vaults</h2>
            <p className="mt-1 text-brand-text-secondary">
              Manage your encrypted key vaults
            </p>
          </div>
          <CreateVaultDialog />
        </div>

        <VaultToolbar
          onSearch={handleSearch}
          onSortChange={handleSortChange}
          onViewChange={handleViewChange}
          view={view}
          sort={sort}
        />

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-lg" />
            ))}
          </div>
        ) : vaults.length === 0 ? (
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
                  : "Create your first vault to start organizing your API keys."}
              </p>
            </CardContent>
          </Card>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vaults.map((vault) => (
              <VaultCard key={vault.id} vault={vault} />
            ))}
          </div>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Keys</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {vaults.map((vault) => (
                  <VaultListRow key={vault.id} vault={vault} />
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
