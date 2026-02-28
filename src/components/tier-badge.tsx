"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TierBadge() {
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

  return (
    <Link
      href={isPro ? "/dashboard/settings" : "/dashboard/pricing"}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
        isPro
          ? "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15"
          : "bg-brand-card text-brand-text-muted hover:bg-brand-card-hover hover:text-brand-text-secondary"
      )}
    >
      {isPro ? (
        <>
          <Crown className="h-3 w-3" />
          <span>Pro Plan</span>
        </>
      ) : (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-text-muted" />
          <span>Free Plan — Upgrade</span>
        </>
      )}
    </Link>
  );
}
