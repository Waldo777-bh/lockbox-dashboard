"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Copy, Check, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface KeyCardProps {
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
  onEdit?: () => void;
  onDelete?: () => void;
}

export function KeyCard({ vaultId, keyData, onEdit, onDelete }: KeyCardProps) {
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
    const timer = setTimeout(() => setCopied(false), 2000);
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

  return (
    <Card className="hover:border-brand-border-bright">
      <CardContent className="p-4 space-y-3">
        {/* Header: service + key name */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="font-mono text-sm font-medium text-brand-accent">
              {keyData.service}
            </span>
            <p className="truncate font-mono text-sm text-brand-text">
              {keyData.keyName}
            </p>
          </div>
          {keyData.project && (
            <Badge variant="secondary" className="ml-2 shrink-0">
              {keyData.project}
            </Badge>
          )}
        </div>

        {/* Masked value with reveal */}
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate font-mono text-sm text-brand-text-muted">
            {revealed && value
              ? value
              : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={toggleReveal}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : revealed ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">{revealed ? "Hide" : "Reveal"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={copyToClipboard}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-brand-accent" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="sr-only">Copy</span>
          </Button>
        </div>

        {/* Footer: date + action buttons */}
        <div className="flex items-center justify-between border-t border-brand-border pt-3">
          <span className="text-xs text-brand-text-muted">
            {formatDistanceToNow(new Date(keyData.createdAt), {
              addSuffix: true,
            })}
          </span>
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onEdit}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-brand-danger hover:text-brand-danger"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
