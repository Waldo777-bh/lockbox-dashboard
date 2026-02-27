import { ScrollText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

function getActionBadgeVariant(action: string) {
  if (action.includes("CREATED") || action.includes("ADDED"))
    return "default" as const;
  if (action.includes("DELETED") || action.includes("REVOKED"))
    return "destructive" as const;
  if (action.includes("DECRYPTED")) return "blue" as const;
  if (action.includes("UPDATED")) return "warning" as const;
  return "secondary" as const;
}

export default async function AuditPage() {
  const user = await getCurrentUser();

  const logs = await db.auditLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-brand-text">Audit Log</h2>
        <p className="mt-1 text-brand-text-secondary">
          Track all actions performed on your vaults
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10">
              <ScrollText className="h-6 w-6 text-brand-accent" />
            </div>
            <CardTitle className="text-brand-text-secondary">
              No activity yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-brand-text-muted">
              Your audit trail will appear here once you start using Lockbox.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Service / Key</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm text-brand-text-muted">
                    {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionBadgeVariant(log.action)}>
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.service
                      ? `${log.service}${log.keyName ? `/${log.keyName}` : ""}`
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-brand-text-muted">
                    {log.metadata &&
                    typeof log.metadata === "object" &&
                    log.metadata !== null &&
                    "vaultName" in log.metadata
                      ? String(
                          (log.metadata as Record<string, unknown>).vaultName
                        )
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
