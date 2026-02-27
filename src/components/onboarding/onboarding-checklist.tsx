"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Circle, Lock, KeyRound, Key, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface OnboardingChecklistProps {
  vaultCount: number;
  keyCount: number;
  apiKeyCount: number;
}

interface ChecklistItem {
  label: string;
  done: boolean;
  icon: React.ElementType;
  href?: string;
}

export function OnboardingChecklist({
  vaultCount,
  keyCount,
  apiKeyCount,
}: OnboardingChecklistProps) {
  const router = useRouter();

  const items: ChecklistItem[] = [
    {
      label: "Create a vault",
      done: vaultCount > 0,
      icon: Lock,
      href: "/dashboard/vaults",
    },
    {
      label: "Add a key",
      done: keyCount > 0,
      icon: KeyRound,
      href: "/dashboard/vaults",
    },
    {
      label: "Generate an API key",
      done: apiKeyCount > 0,
      icon: Key,
      href: "/dashboard/api-keys",
    },
    {
      label: "Connect the CLI",
      done: false,
      icon: Terminal,
      href: "/dashboard/settings",
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const progress = (completedCount / items.length) * 100;

  async function handleDismiss() {
    try {
      await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      toast.success("Checklist dismissed");
      router.refresh();
    } catch {
      toast.error("Failed to dismiss checklist");
    }
  }

  return (
    <Card className="border-l-4 border-l-brand-accent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Getting Started</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-brand-text-muted hover:text-brand-text-secondary"
          >
            Dismiss
          </Button>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-border">
          <div
            className="h-full rounded-full bg-brand-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-brand-text-muted">
          {completedCount}/{items.length} complete
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item) => {
            const content = (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md p-2 transition-colors",
                  !item.done && item.href && "hover:bg-brand-bg-secondary cursor-pointer"
                )}
              >
                {item.done ? (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-accent/10">
                    <Check className="h-3 w-3 text-brand-accent" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-brand-text-muted" />
                )}
                <div className="flex items-center gap-2">
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      item.done
                        ? "text-brand-accent"
                        : "text-brand-text-muted"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      item.done
                        ? "text-brand-text-secondary line-through"
                        : "text-brand-text"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            );

            if (!item.done && item.href) {
              return (
                <Link key={item.label} href={item.href}>
                  {content}
                </Link>
              );
            }

            return <div key={item.label}>{content}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
