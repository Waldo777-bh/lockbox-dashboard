"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  AlertCircle,
  Lock,
  Key,
  ExternalLink,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncStatusBannerProps {
  isSynced: boolean;
  lastSyncedAt: string | null;
  vaultCount: number;
  totalKeys: number;
  hasExtensionToken: boolean;
}

export function SyncStatusBanner({
  isSynced,
  lastSyncedAt,
  vaultCount,
  totalKeys,
  hasExtensionToken,
}: SyncStatusBannerProps) {
  // Welcome state: no extension token at all
  if (!hasExtensionToken && !isSynced) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-lg border border-brand-border bg-gradient-to-r from-brand-accent/5 via-brand-card to-brand-card p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
              <Rocket className="h-5 w-5 text-brand-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-text">
                Welcome to Lockbox
              </p>
              <p className="text-xs text-brand-text-secondary">
                Connect the browser extension to sync your encrypted keys
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/extension-setup"
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-brand-bg transition-colors hover:bg-brand-accent-dim"
          >
            Get Started
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    );
  }

  // Not synced but has token: extension is connected but hasn't synced
  if (!isSynced) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-lg border border-brand-warning/20 bg-brand-warning/5 p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-brand-warning" />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-brand-warning">
                Extension Not Connected
              </span>
              <span className="text-xs text-brand-text-secondary">
                Sync your wallet to view keys here
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/extension-setup"
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-warning/30 px-3 py-1.5 text-sm font-medium text-brand-warning transition-colors hover:bg-brand-warning/10"
          >
            Setup Extension
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.div>
    );
  }

  // Synced: green success banner
  const syncAgo = lastSyncedAt
    ? formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: false })
    : "just now";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 shrink-0 text-brand-accent" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-medium text-brand-accent">
              Wallet Synced
            </span>
            <span className="text-brand-text-muted">&middot;</span>
            <span className="text-brand-text-secondary">
              Last sync: {syncAgo} ago
            </span>
            <span className="hidden text-brand-text-muted sm:inline">
              &middot;
            </span>
            <span className="flex items-center gap-1 text-brand-text-secondary">
              <Lock className={cn("h-3 w-3")} />
              {vaultCount} vault{vaultCount !== 1 ? "s" : ""}
            </span>
            <span className="text-brand-text-muted">&middot;</span>
            <span className="flex items-center gap-1 text-brand-text-secondary">
              <Key className="h-3 w-3" />
              {totalKeys} key{totalKeys !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
