"use client";

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Lock, Key, Clock, Layers } from "lucide-react";

interface VaultSummaryCardProps {
  name: string;
  keyCount: number;
  services: string[];
  lastModified: string;
}

export function VaultSummaryCard({
  name,
  keyCount,
  services,
  lastModified,
}: VaultSummaryCardProps) {
  const modifiedAgo = formatDistanceToNow(new Date(lastModified), {
    addSuffix: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex h-full min-w-[260px] w-[280px] shrink-0 flex-col rounded-lg border border-brand-border bg-brand-card p-4 transition-all duration-200 hover:border-brand-accent/30 hover:shadow-[0_0_20px_rgba(34,214,138,0.06)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
          <Lock className="h-5 w-5 text-brand-accent" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-text">
            {name}
          </p>
          <p className="flex items-center gap-1 text-xs text-brand-text-muted">
            <Clock className="h-3 w-3" />
            {modifiedAgo}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Key className="h-3.5 w-3.5 text-brand-text-muted" />
          <span className="text-sm font-medium tabular-nums text-brand-text">
            {keyCount}
          </span>
          <span className="text-xs text-brand-text-secondary">
            key{keyCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-brand-text-muted" />
          <span className="text-sm font-medium tabular-nums text-brand-text">
            {services.length}
          </span>
          <span className="text-xs text-brand-text-secondary">
            service{services.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Service tags */}
      {services.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {services.slice(0, 4).map((svc) => (
            <span
              key={svc}
              className="inline-flex items-center rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-xs text-brand-text-secondary"
            >
              {svc}
            </span>
          ))}
          {services.length > 4 && (
            <span className="inline-flex items-center rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-xs text-brand-text-muted">
              +{services.length - 4}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
