import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentVaultsProps {
  vaults: Array<{
    id: string;
    name: string;
    _count: { keys: number };
    updatedAt: Date;
  }>;
}

export function RecentVaults({ vaults }: RecentVaultsProps) {
  if (vaults.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-brand-text-secondary">
        Recent Vaults
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {vaults.slice(0, 3).map((vault) => (
          <Link key={vault.id} href={`/dashboard/vaults/${vault.id}`}>
            <Card className="transition-all duration-200 hover:border-brand-border-bright hover:shadow-[0_0_20px_rgba(34,214,138,0.06)]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-accent/10">
                      <Lock className="h-4 w-4 text-brand-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-brand-text">
                        {vault.name}
                      </p>
                      <p className="text-xs text-brand-text-muted">
                        {formatDistanceToNow(new Date(vault.updatedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {vault._count.keys} {vault._count.keys === 1 ? "key" : "keys"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <Link
        href="/dashboard/vaults"
        className="inline-flex items-center gap-1 text-sm text-brand-text-muted hover:text-brand-accent transition-colors"
      >
        View all vaults
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
