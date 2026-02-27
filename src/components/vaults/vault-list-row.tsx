"use client";

import Link from "next/link";
import {
  Lock,
  Key,
  Shield,
  Database,
  Cloud,
  Server,
  Code,
  Globe,
  Zap,
  Folder,
  Star,
  Heart,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";

const emojiIconMap: Record<string, LucideIcon> = {
  lock: Lock,
  key: Key,
  shield: Shield,
  database: Database,
  cloud: Cloud,
  server: Server,
  code: Code,
  globe: Globe,
  zap: Zap,
  folder: Folder,
  star: Star,
  heart: Heart,
};

interface VaultListRowProps {
  vault: {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    emoji?: string | null;
    _count: { keys: number };
    updatedAt: string | Date;
  };
  onEdit?: (vault: VaultListRowProps["vault"]) => void;
  onDelete?: (vaultId: string) => void;
}

export function VaultListRow({ vault, onEdit, onDelete }: VaultListRowProps) {
  const color = vault.color || "#22d68a";
  const EmojiIcon = emojiIconMap[vault.emoji || "lock"] || Lock;

  return (
    <TableRow className="group cursor-pointer transition-colors hover:bg-brand-card-hover">
      <TableCell>
        <Link
          href={`/dashboard/vaults/${vault.id}`}
          className="flex items-center gap-3"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: `${color}15` }}
          >
            <EmojiIcon className="h-4 w-4" style={{ color }} />
          </div>
          <span className="font-medium text-brand-text">{vault.name}</span>
        </Link>
      </TableCell>
      <TableCell>
        <Link href={`/dashboard/vaults/${vault.id}`}>
          <span className="text-sm text-brand-text-muted truncate max-w-[250px] block">
            {vault.description || "--"}
          </span>
        </Link>
      </TableCell>
      <TableCell>
        <Link href={`/dashboard/vaults/${vault.id}`}>
          <Badge variant="secondary">
            {vault._count.keys} {vault._count.keys === 1 ? "key" : "keys"}
          </Badge>
        </Link>
      </TableCell>
      <TableCell>
        <Link href={`/dashboard/vaults/${vault.id}`}>
          <span className="text-sm text-brand-text-muted">
            {formatDistanceToNow(new Date(vault.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </Link>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(vault)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/vaults/${vault.id}`}>
                <Download className="mr-2 h-4 w-4" />
                View Keys
              </Link>
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem
                className="text-brand-danger focus:text-brand-danger"
                onClick={() => onDelete(vault.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
