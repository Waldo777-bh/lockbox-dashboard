import { Lock, KeyRound, Activity, Plus } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [vaultCount, keyCount, recentLogs] = await Promise.all([
    db.vault.count({ where: { userId: user.id } }),
    db.key.count({
      where: { vault: { userId: user.id } },
    }),
    db.auditLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-brand-text">Welcome back</h2>
        <p className="mt-1 text-brand-text-secondary">
          Here&apos;s an overview of your encrypted vaults
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-text-secondary">
              Total Vaults
            </CardTitle>
            <Lock className="h-4 w-4 text-brand-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-text">
              {vaultCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-text-secondary">
              Total Keys
            </CardTitle>
            <KeyRound className="h-4 w-4 text-brand-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-text">
              {keyCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-brand-text-secondary">
              Recent Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-brand-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-text">
              {recentLogs.length}
            </div>
            <p className="text-xs text-brand-text-muted">recent events</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity or Get Started */}
      {recentLogs.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions on your vaults</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-md border border-brand-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        log.action.includes("DELETE")
                          ? "destructive"
                          : log.action.includes("DECRYPT")
                            ? "blue"
                            : "default"
                      }
                    >
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                    {log.service && (
                      <span className="font-mono text-sm text-brand-text-secondary">
                        {log.service}
                        {log.keyName ? `/${log.keyName}` : ""}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-brand-text-muted">
                    {formatDistanceToNow(new Date(log.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your first vault to start storing API keys securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/vaults">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Vault
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
