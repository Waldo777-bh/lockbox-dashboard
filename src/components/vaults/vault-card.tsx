"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface VaultCardProps {
  vault: {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    emoji?: string | null;
    _count: { keys: number };
    updatedAt: string | Date;
  };
}

export function VaultCard({ vault }: VaultCardProps) {
  const color = vault.color || "#22d68a";
  const EmojiIcon = emojiIconMap[vault.emoji || "lock"] || Lock;

  return (
    <Link href={`/dashboard/vaults/${vault.id}`}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="group relative overflow-hidden rounded-lg border border-brand-border bg-brand-card shadow-sm transition-colors hover:border-brand-border-bright"
        style={{
          borderLeftWidth: "3px",
          borderLeftColor: color,
        }}
      >
        {/* Hover glow effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background: `radial-gradient(ellipse at 0% 50%, ${color}08 0%, transparent 70%)`,
          }}
        />

        <div className="relative p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-md"
                style={{ backgroundColor: `${color}15` }}
              >
                <EmojiIcon
                  className="h-4.5 w-4.5"
                  style={{ color }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-brand-text truncate">
                  {vault.name}
                </h3>
                {vault.description && (
                  <p className="mt-0.5 text-sm text-brand-text-muted truncate max-w-[200px]">
                    {vault.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Badge variant="secondary">
              {vault._count.keys} {vault._count.keys === 1 ? "key" : "keys"}
            </Badge>
            <span className="text-xs text-brand-text-muted">
              {formatDistanceToNow(new Date(vault.updatedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
