"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Chrome,
  Puzzle,
  Lock,
  ExternalLink,
  Link2,
  Loader2,
  Trash2,
  RefreshCw,
  Check,
  Circle,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyButton } from "@/components/shared/copy-button";

interface SyncStatus {
  connected: boolean;
  lastSync: string | null;
  syncVersion: number | null;
}

interface ExtensionToken {
  id: string;
  name?: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
}

export function BrowserExtension() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncLoading, setSyncLoading] = useState(true);
  const [tokens, setTokens] = useState<ExtensionToken[]>([]);
  const [tokensLoading, setTokensLoading] = useState(true);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // Fetch sync status from /api/dashboard/summary
  const fetchSyncStatus = useCallback(async () => {
    setSyncLoading(true);
    try {
      const res = await fetch("/api/dashboard/summary");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();

      setSyncStatus({
        connected: !!data.metadata?.lastSync,
        lastSync: data.metadata?.lastSync || null,
        syncVersion: data.metadata?.syncVersion || null,
      });
    } catch {
      setSyncStatus({ connected: false, lastSync: null, syncVersion: null });
    } finally {
      setSyncLoading(false);
    }
  }, []);

  // Fetch active tokens
  const fetchTokens = useCallback(async () => {
    setTokensLoading(true);
    try {
      const res = await fetch("/api/auth/extension-token");
      if (!res.ok) throw new Error("Failed to fetch tokens");
      const data = await res.json();
      setTokens(data.tokens || []);
    } catch {
      setTokens([]);
    } finally {
      setTokensLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyncStatus();
    fetchTokens();
  }, [fetchSyncStatus, fetchTokens]);

  // Generate a new token
  async function handleGenerateToken() {
    setGeneratingToken(true);
    setNewToken(null);
    try {
      const res = await fetch("/api/auth/extension-token", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate token");
      }
      const data = await res.json();
      setNewToken(data.token);
      toast.success("Extension token generated");
      fetchTokens();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate token");
    } finally {
      setGeneratingToken(false);
    }
  }

  // Revoke a token
  async function handleRevokeToken(id: string) {
    setRevokingId(id);
    try {
      const res = await fetch(`/api/auth/extension-token?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke token");
      toast.success("Token revoked");
      setTokens((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Failed to revoke token");
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Section */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-brand-text-secondary">
          Connection Status
        </h4>

        {syncLoading ? (
          <div className="rounded-lg border border-brand-border bg-brand-card p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-brand-border bg-brand-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {syncStatus?.connected ? (
                  <div className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-40" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-accent" />
                  </div>
                ) : (
                  <div className="h-3 w-3 rounded-full bg-brand-text-muted" />
                )}
                <span className="text-sm font-medium text-brand-text">
                  {syncStatus?.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchSyncStatus}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>

            {syncStatus?.connected && (
              <div className="mt-3 space-y-1.5">
                {syncStatus.lastSync && (
                  <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                    <Clock className="h-3 w-3" />
                    <span>
                      Last sync:{" "}
                      {formatDistanceToNow(new Date(syncStatus.lastSync), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
                {syncStatus.syncVersion != null && (
                  <div className="flex items-center gap-2 text-xs text-brand-text-muted">
                    <Shield className="h-3 w-3" />
                    <span>Sync version: {syncStatus.syncVersion}</span>
                  </div>
                )}
              </div>
            )}

            {!syncStatus?.connected && (
              <p className="mt-2 text-xs text-brand-text-muted">
                Generate a token below and connect your extension to enable
                syncing.
              </p>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Token Management Section */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-brand-text-secondary">
          Extension Tokens
        </h4>

        <div className="space-y-3">
          {/* Generate button */}
          <Button
            size="sm"
            onClick={handleGenerateToken}
            disabled={generatingToken}
          >
            {generatingToken ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Generate Extension Token
              </>
            )}
          </Button>

          {/* Newly generated token display */}
          <AnimatePresence>
            {newToken && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-3">
                  <p className="mb-2 text-xs font-medium text-brand-accent">
                    New token generated — copy it now:
                  </p>
                  <div className="flex items-center gap-2 rounded-md border border-brand-border bg-brand-bg p-2">
                    <code className="flex-1 break-all font-mono text-xs text-brand-accent">
                      {newToken}
                    </code>
                    <CopyButton value={newToken} />
                  </div>
                  <p className="mt-2 text-xs text-brand-text-muted">
                    Paste this in your extension under Settings &gt; Dashboard
                    Connection. This token expires in 24 hours.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active tokens list */}
          {tokensLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-card p-3"
                >
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          ) : tokens.length > 0 ? (
            <div className="space-y-2">
              {tokens.map((token) => {
                const isExpired =
                  token.expiresAt && new Date(token.expiresAt) < new Date();

                return (
                  <div
                    key={token.id}
                    className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-card p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-text">
                          {token.name || `Token ${token.id.slice(0, 8)}`}
                        </span>
                        {isExpired ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Expired
                          </Badge>
                        ) : (
                          <Badge variant="default" className="text-[10px]">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-brand-text-muted">
                        <span>
                          Created{" "}
                          {formatDistanceToNow(new Date(token.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {token.lastUsedAt && (
                          <span>
                            Last used{" "}
                            {formatDistanceToNow(new Date(token.lastUsedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeToken(token.id)}
                      disabled={revokingId === token.id}
                      className="ml-2 h-8 w-8 flex-shrink-0 p-0 text-brand-text-muted hover:text-red-400"
                    >
                      {revokingId === token.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Revoke token</span>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-brand-text-muted">
              No active tokens. Generate one to connect your extension.
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* How It Works Section */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-brand-text-secondary">
          How It Works
        </h4>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h5 className="text-sm font-medium text-brand-text">
                Local-First Wallet
              </h5>
              <p className="mt-0.5 text-xs text-brand-text-secondary">
                Your API keys are encrypted locally with AES-256-GCM using your
                master password. The extension wallet stores everything on your
                device. Only encrypted metadata is synced to the dashboard for
                display.
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/extension-setup">
              View Full Setup Guide
              <ArrowRight className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>

      {/* Keyboard shortcut tip */}
      <div className="rounded-lg border border-brand-border bg-brand-card p-3">
        <p className="text-xs text-brand-text-muted">
          <strong className="text-brand-text-secondary">Tip:</strong> Press{" "}
          <kbd className="rounded border border-brand-border bg-brand-bg px-1.5 py-0.5 font-mono text-[10px] text-brand-text-secondary">
            Alt+Shift+L
          </kbd>{" "}
          to open Lockbox from anywhere in the browser.
        </p>
      </div>
    </div>
  );
}
