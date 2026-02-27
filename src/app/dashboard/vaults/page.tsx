import Link from "next/link";
import { Lock, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateVaultDialog } from "@/components/vaults/create-vault-dialog";
import { formatDistanceToNow } from "date-fns";

export default async function VaultsPage() {
  const user = await getCurrentUser();

  const vaults = await db.vault.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { keys: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">Vaults</h2>
          <p className="mt-1 text-brand-text-secondary">
            Manage your encrypted key vaults
          </p>
        </div>
        <CreateVaultDialog />
      </div>

      {vaults.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10">
              <Lock className="h-6 w-6 text-brand-accent" />
            </div>
            <CardTitle className="text-brand-text-secondary">
              No vaults yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-brand-text-muted">
              Create your first vault to start organizing your API keys.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vaults.map((vault) => (
            <Link key={vault.id} href={`/dashboard/vaults/${vault.id}`}>
              <Card className="cursor-pointer transition-colors hover:border-brand-border-bright hover:bg-brand-card-hover">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-accent/10">
                      <Lock className="h-4 w-4 text-brand-accent" />
                    </div>
                    <CardTitle className="text-base">{vault.name}</CardTitle>
                  </div>
                  <ChevronRight className="h-4 w-4 text-brand-text-muted" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-text-secondary">
                      {vault._count.keys}{" "}
                      {vault._count.keys === 1 ? "key" : "keys"}
                    </span>
                    <span className="text-brand-text-muted">
                      {formatDistanceToNow(new Date(vault.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
