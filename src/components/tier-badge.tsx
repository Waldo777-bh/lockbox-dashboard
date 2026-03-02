"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Crown, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  /** "compact" for header/inline, "full" for sidebar/page */
  variant?: "compact" | "full";
}

export function TierBadge({ variant = "full" }: TierBadgeProps) {
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/tier")
      .then((r) => r.json())
      .then((data) => setTier(data.tier))
      .catch(() => setTier("free"));
  }, []);

  if (tier === null) {
    return (
      <div className="flex items-center justify-center py-1">
        <Loader2 className="h-3 w-3 animate-spin text-brand-text-muted" />
      </div>
    );
  }

  const isPro = tier === "pro";

  if (variant === "compact") {
    return (
      <Link
        href={isPro ? "/dashboard/settings" : "/dashboard/pricing"}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all",
          isPro
            ? "bg-gradient-to-r from-amber-500/15 to-yellow-400/15 text-amber-400 border border-amber-400/25 hover:border-amber-400/40 hover:shadow-[0_0_12px_rgba(251,191,36,0.15)]"
            : "bg-brand-card text-brand-text-muted hover:bg-brand-card-hover hover:text-brand-text-secondary border border-brand-border"
        )}
      >
        {isPro ? (
          <>
            <Crown className="h-3 w-3" />
            <span>Pro</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3" />
            <span>Upgrade</span>
          </>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={isPro ? "/dashboard/settings" : "/dashboard/pricing"}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all",
        isPro
          ? "bg-gradient-to-r from-amber-500/10 to-yellow-400/10 text-amber-400 border border-amber-400/20 hover:border-amber-400/35 hover:shadow-[0_0_16px_rgba(251,191,36,0.1)]"
          : "bg-brand-card text-brand-text-muted hover:bg-brand-card-hover hover:text-brand-text-secondary border border-brand-border"
      )}
    >
      {isPro ? (
        <>
          <Crown className="h-3.5 w-3.5" />
          <div className="flex flex-col">
            <span className="font-semibold">Pro Plan</span>
            <span className="text-[10px] text-amber-400/60">Active</span>
          </div>
        </>
      ) : (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-text-muted" />
          <div className="flex flex-col">
            <span>Free Plan</span>
            <span className="text-[10px] text-brand-accent">Upgrade →</span>
          </div>
        </>
      )}
    </Link>
  );
}
