import { KeyRound } from "lucide-react";
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
import { GenerateKeyDialog } from "@/components/api-keys/generate-key-dialog";
import { RevokeKeyDialog } from "@/components/api-keys/revoke-key-dialog";
import { format, formatDistanceToNow } from "date-fns";

export default async function ApiKeysPage() {
  const user = await getCurrentUser();

  const apiKeys = await db.apiKey.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsed: true,
      expiresAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-brand-text">API Keys</h2>
          <p className="mt-1 text-brand-text-secondary">
            Generate keys for programmatic access to your vaults
          </p>
        </div>
        <GenerateKeyDialog />
      </div>

      {/* Warning */}
      <div className="rounded-md border border-brand-warning/30 bg-brand-warning/5 p-4">
        <p className="text-sm text-brand-warning">
          API keys provide full access to your vaults. Treat them like
          passwords and never share them publicly.
        </p>
      </div>

      {apiKeys.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-accent/10">
              <KeyRound className="h-6 w-6 text-brand-accent" />
            </div>
            <CardTitle className="text-brand-text-secondary">
              No API keys yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-brand-text-muted">
              Generate an API key to access your vaults programmatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key Prefix</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-brand-bg-secondary px-2 py-1 font-mono text-sm">
                      {key.prefix}...
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-brand-text-muted">
                    {key.lastUsed
                      ? formatDistanceToNow(new Date(key.lastUsed), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {key.expiresAt ? (
                      new Date(key.expiresAt) < new Date() ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        format(new Date(key.expiresAt), "MMM d, yyyy")
                      )
                    ) : (
                      <span className="text-brand-text-muted">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-brand-text-muted">
                    {format(new Date(key.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <RevokeKeyDialog
                      keyId={key.id}
                      keyName={key.name}
                      prefix={key.prefix}
                    />
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
