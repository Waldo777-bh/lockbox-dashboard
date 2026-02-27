import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddKeyDialog } from "@/components/keys/add-key-dialog";
import { DeleteVaultDialog } from "@/components/vaults/delete-vault-dialog";
import { KeyRow } from "@/components/keys/key-row";

export default async function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  const vault = await db.vault.findFirst({
    where: { id, userId: user.id },
    include: {
      keys: {
        select: {
          id: true,
          service: true,
          keyName: true,
          project: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { service: "asc" },
      },
    },
  });

  if (!vault) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-brand-text-muted">
        <Link
          href="/dashboard/vaults"
          className="hover:text-brand-text-secondary"
        >
          Vaults
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-brand-text">{vault.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-accent/10">
            <Lock className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-brand-text">
              {vault.name}
            </h2>
            <p className="text-sm text-brand-text-secondary">
              {vault.keys.length}{" "}
              {vault.keys.length === 1 ? "key" : "keys"} stored
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddKeyDialog vaultId={vault.id} />
          <DeleteVaultDialog vaultId={vault.id} vaultName={vault.name} />
        </div>
      </div>

      {/* Keys Table */}
      {vault.keys.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-brand-text-secondary">
              No keys yet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-brand-text-muted">
              Add your first key to this vault using the button above.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Key Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vault.keys.map((key) => (
                <KeyRow
                  key={key.id}
                  vaultId={vault.id}
                  keyData={{
                    ...key,
                    createdAt: key.createdAt.toISOString(),
                    updatedAt: key.updatedAt.toISOString(),
                  }}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
