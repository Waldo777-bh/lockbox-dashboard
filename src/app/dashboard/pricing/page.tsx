"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  Loader2,
  Lock,
  Zap,
  Users,
  Shield,
  Key,
  Terminal,
  Globe,
  Clock,
  Cloud,
  Crown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/page-transition";
import type { TierInfo } from "@/lib/tier";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [loading, setLoading] = useState(false);
  const [tierInfo, setTierInfo] = useState<TierInfo | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/tier")
      .then((r) => r.json())
      .then(setTierInfo)
      .catch(() => {});
  }, []);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billing }),
      });

      if (!res.ok) throw new Error("Failed to create checkout");

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const faqs = [
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your Pro subscription at any time. You'll keep Pro access until the end of your billing period, then you'll be downgraded back to Free.",
    },
    {
      q: "What happens to my extra vaults/keys if I downgrade?",
      a: "Your wallet reverts to Free tier limits: 1 vault with up to 25 keys. Any additional vaults and keys beyond these limits will be locked and inaccessible until you upgrade again. Nothing is deleted — upgrade anytime to restore full access.",
    },
    {
      q: "Is there a free trial?",
      a: "The Free tier IS your trial. Use it for as long as you want with 1 vault and 25 keys. When you need more, upgrade to Pro.",
    },
    {
      q: "How do I activate Pro on the CLI?",
      a: 'After upgrading, you\'ll receive a licence key. Run: lockbox config --licence YOUR_KEY to activate Pro on your CLI.',
    },
  ];

  const isPro = tierInfo?.tier === "pro";

  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-brand-text">
            Simple, transparent pricing
          </h2>
          <p className="mt-2 text-brand-text-secondary">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3">
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              billing === "monthly"
                ? "bg-brand-accent/10 text-brand-accent"
                : "text-brand-text-muted hover:text-brand-text"
            }`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              billing === "annual"
                ? "bg-brand-accent/10 text-brand-accent"
                : "text-brand-text-muted hover:text-brand-text"
            }`}
            onClick={() => setBilling("annual")}
          >
            Annual{" "}
            <Badge
              variant="secondary"
              className="ml-1 bg-brand-accent/15 text-brand-accent"
            >
              Save 20%
            </Badge>
          </button>
        </div>

        {/* Tier Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Free Tier */}
          <Card className="relative flex flex-col border-brand-border bg-brand-card p-6">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand-text-secondary" />
                <h3 className="text-lg font-semibold text-brand-text">Free</h3>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-brand-text">$0</span>
                <span className="text-brand-text-muted">/forever</span>
              </div>
              <p className="mt-2 text-sm text-brand-text-secondary">
                Perfect for getting started
              </p>
            </div>

            {isPro ? (
              <Button variant="outline" disabled className="w-full">
                Previous Plan
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full">
                <Check className="mr-2 h-4 w-4" />
                Current Plan
              </Button>
            )}

            <ul className="mt-6 space-y-3 text-sm">
              <Feature text="1 vault" />
              <Feature text="25 keys" />
              <Feature text="Full CLI access (16 commands)" />
              <Feature text="MCP server integration" />
              <Feature text="Proxy key system (lockbox://)" />
              <Feature text="Local audit log" />
              <Feature text="Dashboard access" />
              <Feature text="Chrome & VS Code extensions" />
            </ul>
          </Card>

          {/* Pro Tier — Highlighted */}
          <Card className="relative flex flex-col border-brand-accent/50 bg-brand-card p-6 shadow-lg shadow-brand-accent/5 ring-1 ring-brand-accent/20">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-accent text-black">
              Most Popular
            </Badge>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-accent" />
                <h3 className="text-lg font-semibold text-brand-text">Pro</h3>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-brand-text">
                  ${billing === "monthly" ? "5" : "4"}
                </span>
                <span className="text-brand-text-muted">/month</span>
                {billing === "annual" && (
                  <span className="ml-2 text-sm text-brand-text-muted">
                    ($48/year)
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-brand-text-secondary">
                For serious developers
              </p>
            </div>

            {isPro ? (
              <Button variant="outline" disabled className="w-full">
                <Crown className="mr-2 h-4 w-4 text-brand-accent" />
                Current Plan
              </Button>
            ) : (
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-brand-accent text-black hover:bg-brand-accent/90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upgrade Now
              </Button>
            )}

            <ul className="mt-6 space-y-3 text-sm">
              <Feature text="Unlimited vaults" highlight />
              <Feature text="Unlimited keys" highlight />
              <Feature text="Everything in Free" />
              <Feature text="Key expiry reminders" />
              <Feature text="Cloud sync (coming soon)" />
              <Feature text="Priority support" />
              <Feature text="Full dashboard write access" />
              <Feature text="Full extension write access" />
            </ul>
          </Card>

          {/* Team Tier — Coming Soon */}
          <Card className="relative flex flex-col border-brand-border bg-brand-card p-6 opacity-75">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-text-muted/20 text-brand-text-secondary">
              Coming Soon
            </Badge>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-brand-text-secondary" />
                <h3 className="text-lg font-semibold text-brand-text">Team</h3>
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-brand-text">$5</span>
                <span className="text-brand-text-muted">/user/month</span>
              </div>
              <p className="mt-2 text-sm text-brand-text-secondary">
                Min. 2 users
              </p>
            </div>

            <Button variant="outline" disabled className="w-full">
              Join Waitlist
            </Button>

            <ul className="mt-6 space-y-3 text-sm">
              <Feature text="Everything in Pro" />
              <Feature text="Shared vaults" />
              <Feature text="Role-based access control" />
              <Feature text="Team audit log" />
              <Feature text="SSO integration" />
            </ul>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-2xl">
          <h3 className="mb-4 text-center text-xl font-semibold text-brand-text">
            Frequently Asked Questions
          </h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-lg border border-brand-border bg-brand-card"
              >
                <button
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-brand-text"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  {faq.q}
                  {faqOpen === i ? (
                    <ChevronUp className="h-4 w-4 text-brand-text-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-brand-text-muted" />
                  )}
                </button>
                {faqOpen === i && (
                  <div className="border-t border-brand-border px-4 pb-4 pt-2 text-sm text-brand-text-secondary">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

function Feature({
  text,
  highlight,
}: {
  text: string;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-start gap-2">
      <Check
        className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
          highlight ? "text-brand-accent" : "text-brand-text-muted"
        }`}
      />
      <span
        className={
          highlight ? "font-medium text-brand-text" : "text-brand-text-secondary"
        }
      >
        {text}
      </span>
    </li>
  );
}
