import Link from "next/link";
import { Lock, KeyRound, Key } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const actions = [
  {
    label: "New Vault",
    icon: Lock,
    href: "/dashboard/vaults",
    description: "Create a new encrypted vault",
  },
  {
    label: "Add Key",
    icon: KeyRound,
    href: "/dashboard/vaults",
    description: "Store a new API key or secret",
  },
  {
    label: "Generate API Key",
    icon: Key,
    href: "/dashboard/api-keys",
    description: "Create a key for CLI access",
  },
];

export function QuickActions() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-brand-text-secondary">
        Quick Actions
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="transition-all duration-200 hover:border-brand-border-bright hover:shadow-[0_0_20px_rgba(34,214,138,0.06)]">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
                  <action.icon className="h-5 w-5 text-brand-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-text">
                    {action.label}
                  </p>
                  <p className="text-xs text-brand-text-muted">
                    {action.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
