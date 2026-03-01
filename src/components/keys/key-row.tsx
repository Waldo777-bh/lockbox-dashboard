"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Lock } from "lucide-react";

interface KeyRowProps {
  vaultId: string;
  keyData: {
    id: string;
    service: string;
    keyName: string;
    project: string | null;
    notes: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * KeyRow — metadata-only display.
 * Key VALUES are never available on the dashboard (zero-knowledge architecture).
 * To view or copy key values, users must use the Lockbox extension wallet.
 */
export function KeyRow({ keyData }: KeyRowProps) {
  const lockboxUri = `lockbox://${keyData.service}/${keyData.keyName}`;

  return (
    <TableRow>
      <TableCell>
        <span className="font-mono text-sm text-brand-accent">
          {keyData.service}
        </span>
      </TableCell>
      <TableCell className="font-mono text-sm">{keyData.keyName}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-brand-text-muted">
          <Lock className="h-3.5 w-3.5" />
          <span className="text-xs">Encrypted in wallet</span>
        </div>
      </TableCell>
      <TableCell>
        {keyData.project && (
          <Badge variant="secondary">{keyData.project}</Badge>
        )}
      </TableCell>
      <TableCell className="text-sm text-brand-text-muted">
        {formatDistanceToNow(new Date(keyData.createdAt), {
          addSuffix: true,
        })}
      </TableCell>
      <TableCell>
        <div className="font-mono text-[11px] text-brand-text-muted">
          {lockboxUri}
        </div>
      </TableCell>
    </TableRow>
  );
}
