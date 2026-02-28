"use client";

import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UpgradePromptProps {
  message: string;
  onDismiss?: () => void;
}

export function UpgradePrompt({ message, onDismiss }: UpgradePromptProps) {
  return (
    <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-4 text-center">
      <Zap className="mx-auto mb-2 h-8 w-8 text-brand-accent" />
      <p className="text-sm font-medium text-brand-text">{message}</p>
      <p className="mt-1 text-xs text-brand-text-secondary">
        Upgrade to Pro for unlimited vaults and keys — $5/month.
      </p>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Button
          asChild
          size="sm"
          className="bg-brand-accent text-black hover:bg-brand-accent/90"
        >
          <Link href="/dashboard/pricing">Upgrade Now</Link>
        </Button>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Maybe Later
          </Button>
        )}
      </div>
    </div>
  );
}
