"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Key,
  Shield,
  Database,
  Cloud,
  Server,
  Code,
  Globe,
  Zap,
  Folder,
  Star,
  Heart,
  Info,
  type LucideIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { KeyRow } from "@/components/keys/key-row";
import { PageTransition } from "@/components/layout/page-transition";

const emojiIconMap: Record<string, LucideIcon> = {
  lock: Lock,
  key: Key,
  shield: Shield,
  database: Database,
  cloud: Cloud,
  server: Server,
  code: Code,
  globe: Globe,
  zap: Zap,
  folder: Folder,
  star: Star,
  heart: Heart,
};

interface VaultKey {
  id: string;
  service: string;
  keyName: string;
  project: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Vault {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  emoji: string | null;
  keys: VaultKey[];
  createdAt: string;
  updatedAt: string;
}

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [vault, setVault] = useState<Vault | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaultId, setVaultId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => setVaultId(id));
  }, [params]);

  const fetchVault = useCallback(async () => {
    if (!vaultId) return;
    try {
      const res = await fetch(`/api/vaults/${vaultId}`);
      if (!res.ok) {
        if (res.status === 404) {
          router.push("/dashboard/vaults");
          return;
        }
        throw new Error("Failed to fetch vault");
      }
      const data = await res.json();
      setVault(data);
    } catch (error) {
      console.error("Failed to fetch vault:", error);
    } finally {
      setLoading(false);
    }
  }, [vaultId, router]);

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  if (loading || !vault) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const color = vault.color || "#22d68a";
  const EmojiIcon = emojiIconMap[vault.emoji || "lock"] || Lock;

  // Group keys by service for summary
  const serviceGroups: Record<string, string[]> = {};
  for (const key of vault.keys) {
    if (!serviceGroups[key.service]) serviceGroups[key.service] = [];
    serviceGroups[key.service].push(key.keyName);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/vaults">Vaults</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{vault.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div
          className="rounded-lg border border-brand-border bg-brand-card p-6"
          style={{ borderTopWidth: "3px", borderTopColor: color }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}15` }}
            >
              <EmojiIcon className="h-5 w-5" style={{ color }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-brand-text">
                {vault.name}
              </h2>
              {vault.description && (
                <p className="mt-0.5 text-sm text-brand-text-secondary">
                  {vault.description}
                </p>
              )}
              <p className="mt-0.5 text-sm text-brand-text-muted">
                {vault.keys.length}{" "}
                {vault.keys.length === 1 ? "key" : "keys"} &middot;{" "}
                {Object.keys(serviceGroups).length}{" "}
                {Object.keys(serviceGroups).length === 1 ? "service" : "services"}
              </p>
            </div>
          </div>
        </div>

        {/* Zero-knowledge info banner */}
        <div className="flex items-start gap-3 rounded-lg border border-brand-border bg-brand-card p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" />
          <div>
            <p className="text-sm font-medium text-brand-text">
              Key values are only available in the Lockbox extension
            </p>
            <p className="mt-1 text-xs text-brand-text-muted">
              For security, the dashboard only shows key metadata (names, services, timestamps).
              To view, copy, or manage actual key values, use the Lockbox wallet extension in your browser.
            </p>
          </div>
        </div>

        {/* Keys Table — metadata only, no values */}
        {vault.keys.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-brand-text-secondary">
                No keys yet
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-brand-text-muted">
                Add keys using the Lockbox extension wallet in your browser toolbar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Key Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vault.keys.map((key) => (
                  <KeyRow
                    key={key.id}
                    vaultId={vault.id}
                    keyData={{
                      ...key,
                      createdAt:
                        typeof key.createdAt === "string"
                          ? key.createdAt
                          : new Date(key.createdAt).toISOString(),
                      updatedAt:
                        typeof key.updatedAt === "string"
                          ? key.updatedAt
                          : new Date(key.updatedAt).toISOString(),
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
