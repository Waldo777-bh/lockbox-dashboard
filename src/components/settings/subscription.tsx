"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Crown,
  Lock,
  Copy,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { TierInfo } from "@/lib/tier";

export function Subscription() {
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/user/tier")
      .then((r) => r.json())
      .then((data) => {
        setTierInfo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Show success toast if redirected from checkout
  useEffect(() => {
    if (searchParams.get("upgraded") === "true") {
      toast.success(
        "Welcome to Pro! Your licence key is displayed below.",
      );
      // Clean URL
      window.history.replaceState({}, "", "/dashboard/settings");
    }
  }, [searchParams]);

  async function copyLicenceKey() {
    if (!tierInfo?.licenceKey) return;
    await navigator.clipboard.writeText(tierInfo.licenceKey);
    setCopied(true);
    toast.success("Licence key copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-brand-text">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-text-muted" />
        </CardContent>
      </Card>
    );
  }

  const isPro = tierInfo?.tier === "pro";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-brand-text">Subscription</CardTitle>
          <Badge
            className={
              isPro
                ? "bg-brand-accent/15 text-brand-accent"
                : "bg-brand-text-muted/15 text-brand-text-secondary"
            }
          >
            {isPro ? (
              <>
                <Crown className="mr-1 h-3 w-3" /> PRO
              </>
            ) : (
              <>
                <Lock className="mr-1 h-3 w-3" /> FREE
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPro ? (
          <>
            {/* Licence Key */}
            {tierInfo?.licenceKey && (
              <div>
                <label className="text-sm font-medium text-brand-text-secondary">
                  Licence Key
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-brand-bg-secondary px-3 py-2 font-mono text-sm text-brand-text">
                    {tierInfo.licenceKey}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyLicenceKey}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-brand-accent" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-brand-text-muted">
                  To activate Pro on your CLI, run:{" "}
                  <code className="rounded bg-brand-bg-secondary px-1 py-0.5">
                    lockbox config --licence {tierInfo.licenceKey}
                  </code>
                </p>
              </div>
            )}

            {/* Usage */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-brand-bg-secondary p-3">
                <p className="text-xs text-brand-text-muted">Vaults</p>
                <p className="text-lg font-semibold text-brand-text">
                  {tierInfo?.usage.vaults}{" "}
                  <span className="text-sm font-normal text-brand-text-muted">
                    / unlimited
                  </span>
                </p>
              </div>
              <div className="rounded-lg bg-brand-bg-secondary p-3">
                <p className="text-xs text-brand-text-muted">Keys</p>
                <p className="text-lg font-semibold text-brand-text">
                  {tierInfo?.usage.keys}{" "}
                  <span className="text-sm font-normal text-brand-text-muted">
                    / unlimited
                  </span>
                </p>
              </div>
            </div>

            {/* Manage */}
            <Button
              variant="outline"
              onClick={openPortal}
              disabled={portalLoading}
            >
              {portalLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <ExternalLink className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </>
        ) : (
          <>
            {/* Usage with limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-brand-bg-secondary p-3">
                <p className="text-xs text-brand-text-muted">Vaults</p>
                <p className="text-lg font-semibold text-brand-text">
                  {tierInfo?.usage.vaults}{" "}
                  <span className="text-sm font-normal text-brand-text-muted">
                    / {tierInfo?.limits.vaults}
                  </span>
                </p>
              </div>
              <div className="rounded-lg bg-brand-bg-secondary p-3">
                <p className="text-xs text-brand-text-muted">Keys</p>
                <p className="text-lg font-semibold text-brand-text">
                  {tierInfo?.usage.keys}{" "}
                  <span className="text-sm font-normal text-brand-text-muted">
                    / {tierInfo?.limits.keys}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-4">
              <p className="text-sm font-medium text-brand-text">
                Upgrade to Pro for unlimited vaults and keys
              </p>
              <p className="mt-1 text-xs text-brand-text-secondary">
                $5/month or $48/year (save 20%)
              </p>
              <Button asChild className="mt-3 bg-brand-accent text-black hover:bg-brand-accent/90">
                <Link href="/dashboard/pricing">Upgrade to Pro</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
