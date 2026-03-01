"use client";

import { motion } from "framer-motion";
import { CheckCircle, Shield, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSecurityScoreProps {
  isSynced: boolean;
  metadata: {
    vaultCount: number;
    totalKeys: number;
  } | null;
}

interface CheckItem {
  label: string;
  passed: boolean;
  detail: string;
}

export function DashboardSecurityScore({
  isSynced,
  metadata,
}: DashboardSecurityScoreProps) {
  const checks: CheckItem[] = [
    {
      label: "End-to-end encryption",
      passed: true,
      detail: "AES-256-GCM active",
    },
    {
      label: "Auto-lock enabled",
      passed: true,
      detail: "Session timeout active",
    },
    {
      label: "Wallet synced",
      passed: isSynced,
      detail: isSynced ? "Extension connected" : "Extension not connected",
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  // Score bar color
  const barColor =
    score >= 80
      ? "bg-brand-accent"
      : score >= 50
        ? "bg-brand-warning"
        : "bg-brand-danger";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-lg border border-brand-border bg-brand-card p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-4 w-4 text-brand-accent" />
        <h3 className="text-sm font-medium text-brand-text">Security Status</h3>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-brand-text-secondary">
            Security Score
          </span>
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              score >= 80
                ? "text-brand-accent"
                : score >= 50
                  ? "text-brand-warning"
                  : "text-brand-danger"
            )}
          >
            {score}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className={cn("h-full rounded-full", barColor)}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {check.passed ? (
                <CheckCircle className="h-4 w-4 text-brand-accent" />
              ) : (
                <XCircle className="h-4 w-4 text-brand-text-muted" />
              )}
              <span
                className={cn(
                  "text-sm",
                  check.passed
                    ? "text-brand-text"
                    : "text-brand-text-secondary"
                )}
              >
                {check.label}
              </span>
            </div>
            <span className="text-xs text-brand-text-muted">
              {check.detail}
            </span>
          </div>
        ))}
      </div>

      {/* Vault/key count note */}
      {metadata && (
        <div className="mt-4 rounded-md bg-brand-bg px-3 py-2 text-xs text-brand-text-secondary">
          {metadata.totalKeys} key{metadata.totalKeys !== 1 ? "s" : ""}{" "}
          protected across {metadata.vaultCount} encrypted vault
          {metadata.vaultCount !== 1 ? "s" : ""}
        </div>
      )}
    </motion.div>
  );
}
