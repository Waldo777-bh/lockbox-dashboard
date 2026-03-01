"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Shield, Key, Lock } from "lucide-react";

interface PortfolioStatsProps {
  totalKeys: number;
  vaultCount: number;
  lastSyncedAt: string | null;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function useAnimatedNumber(target: number, duration = 900): number {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) {
      setDisplay(0);
      return;
    }

    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);

      setDisplay(Math.round(easedProgress * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    }

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  return display;
}

export function PortfolioStats({
  totalKeys,
  vaultCount,
  lastSyncedAt,
}: PortfolioStatsProps) {
  const animatedKeys = useAnimatedNumber(totalKeys);
  const animatedVaults = useAnimatedNumber(vaultCount);

  const syncAgo = lastSyncedAt
    ? formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: false })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Hero headline */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-brand-text sm:text-4xl">
          <span className="tabular-nums text-brand-accent">
            {animatedKeys}
          </span>{" "}
          key{totalKeys !== 1 ? "s" : ""} secured across{" "}
          <span className="tabular-nums text-brand-accent">
            {animatedVaults}
          </span>{" "}
          vault{vaultCount !== 1 ? "s" : ""}
        </h1>
        {syncAgo && (
          <p className="text-sm text-brand-text-secondary">
            Synced {syncAgo} ago via Lockbox Wallet
          </p>
        )}
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-4 py-2.5"
        >
          <Key className="h-4 w-4 text-brand-accent" />
          <div>
            <p className="text-lg font-bold tabular-nums text-brand-text">
              {animatedKeys}
            </p>
            <p className="text-xs text-brand-text-secondary">Total Keys</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-4 py-2.5"
        >
          <Lock className="h-4 w-4 text-brand-purple" />
          <div>
            <p className="text-lg font-bold tabular-nums text-brand-text">
              {animatedVaults}
            </p>
            <p className="text-xs text-brand-text-secondary">Vaults</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card px-4 py-2.5"
        >
          <Shield className="h-4 w-4 text-brand-blue" />
          <div>
            <p className="text-lg font-bold text-brand-text">AES-256</p>
            <p className="text-xs text-brand-text-secondary">Encryption</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
