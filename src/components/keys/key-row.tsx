"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { EditKeyDialog } from "./edit-key-dialog";
import { DeleteKeyDialog } from "./delete-key-dialog";
import { formatDistanceToNow } from "date-fns";

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

export function KeyRow({ vaultId, keyData }: KeyRowProps) {
  const [revealed, setRevealed] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-hide revealed value after 10 seconds
  useEffect(() => {
    if (!revealed) return;

    const timer = setTimeout(() => {
      setRevealed(false);
      setValue(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [revealed]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [copied]);

  async function toggleReveal() {
    if (revealed) {
      setRevealed(false);
      setValue(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/vaults/${vaultId}/keys/${keyData.id}/decrypt`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to decrypt key");
      }

      const data = await res.json();
      setValue(data.value);
      setRevealed(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to decrypt key"
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    try {
      let val = value;

      if (!val) {
        // Decrypt first if not already revealed
        const res = await fetch(
          `/api/vaults/${vaultId}/keys/${keyData.id}/decrypt`
        );
        if (!res.ok) throw new Error("Failed to decrypt");
        const data = await res.json();
        val = data.value;
      }

      await navigator.clipboard.writeText(val!);
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to copy"
      );
    }
  }

  const lockboxUri = `lockbox://${keyData.service}/${keyData.keyName}`;

  return (
    <TableRow>
      <TableCell>
        <div>
          <span className="font-mono text-sm text-brand-accent">
            {keyData.service}
          </span>
        </div>
      </TableCell>
      <TableCell className="font-mono text-sm">{keyData.keyName}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-brand-text-muted">
            {revealed && value ? value : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
          </span>
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleReveal}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : revealed ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {revealed ? "Hide" : "Reveal"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-4 w-4 text-brand-accent" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy</span>
          </Button>

          <EditKeyDialog
            vaultId={vaultId}
            keyId={keyData.id}
            currentService={keyData.service}
            currentKeyName={keyData.keyName}
            currentProject={keyData.project}
            currentNotes={keyData.notes}
          />

          <DeleteKeyDialog
            vaultId={vaultId}
            keyId={keyData.id}
            service={keyData.service}
            keyName={keyData.keyName}
          />
        </div>
        <div className="mt-1">
          <span className="font-mono text-[11px] text-brand-text-muted">
            {lockboxUri}
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
