"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  formatDistanceToNow,
  isToday,
  isYesterday,
  differenceInDays,
  format,
} from "date-fns";

interface AuditLog {
  id: string;
  action: string;
  service?: string | null;
  keyName?: string | null;
  metadata?: any;
  createdAt: string;
}

interface AuditTimelineProps {
  logs: AuditLog[];
}

function getActionColor(action: string): string {
  if (action.includes("CREATED") || action.includes("ADDED")) return "#22d68a";
  if (action.includes("DELETED") || action.includes("REVOKED")) return "#e8485c";
  if (action.includes("DECRYPTED")) return "#4a9eff";
  if (action.includes("UPDATED") || action.includes("EXPORTED")) return "#f0a744";
  return "#8b8fa3";
}

function getActionBadgeVariant(action: string) {
  if (action.includes("CREATED") || action.includes("ADDED"))
    return "default" as const;
  if (action.includes("DELETED") || action.includes("REVOKED"))
    return "destructive" as const;
  if (action.includes("DECRYPTED")) return "blue" as const;
  if (action.includes("UPDATED") || action.includes("EXPORTED"))
    return "warning" as const;
  return "secondary" as const;
}

function getDateGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (differenceInDays(new Date(), date) <= 7) return "This Week";
  return format(date, "MMMM d, yyyy");
}

function groupLogsByDate(logs: AuditLog[]): Map<string, AuditLog[]> {
  const groups = new Map<string, AuditLog[]>();
  for (const log of logs) {
    const label = getDateGroupLabel(log.createdAt);
    const existing = groups.get(label) ?? [];
    existing.push(log);
    groups.set(label, existing);
  }
  return groups;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function AuditTimeline({ logs }: AuditTimelineProps) {
  const grouped = groupLogsByDate(logs);

  return (
    <div className="space-y-6">
      {Array.from(grouped.entries()).map(([dateLabel, groupLogs]) => (
        <div key={dateLabel}>
          <h3 className="mb-3 text-sm font-semibold text-brand-text-secondary">
            {dateLabel}
          </h3>
          <motion.div
            className="space-y-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {groupLogs.map((log) => {
              const color = getActionColor(log.action);
              const relativeTime = formatDistanceToNow(new Date(log.createdAt), {
                addSuffix: true,
              });

              return (
                <motion.div
                  key={log.id}
                  variants={itemVariants}
                  className="flex items-start gap-3 rounded-lg border border-brand-border bg-brand-card p-4 transition-colors hover:bg-brand-card-hover"
                >
                  {/* Colored dot */}
                  <div className="mt-1.5 flex-shrink-0">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, " ")}
                      </Badge>
                      {(log.service || log.keyName) && (
                        <span className="font-mono text-sm text-brand-text-secondary">
                          {log.service}
                          {log.keyName ? `/${log.keyName}` : ""}
                        </span>
                      )}
                    </div>
                    {log.metadata &&
                      typeof log.metadata === "object" &&
                      log.metadata !== null &&
                      "vaultName" in log.metadata && (
                        <p className="mt-1 text-sm text-brand-text-muted">
                          {String(
                            (log.metadata as Record<string, unknown>).vaultName
                          )}
                        </p>
                      )}
                  </div>

                  {/* Timestamp */}
                  <span className="flex-shrink-0 text-xs text-brand-text-muted">
                    {relativeTime}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
