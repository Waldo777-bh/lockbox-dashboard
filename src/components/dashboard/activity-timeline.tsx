"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  logs: Array<{
    id: string;
    action: string;
    service?: string | null;
    keyName?: string | null;
    metadata?: unknown;
    createdAt: Date;
  }>;
}

function getActionColor(action: string): {
  dot: string;
  variant: "default" | "destructive" | "blue" | "warning";
} {
  if (action.includes("CREAT") || action.includes("ADD")) {
    return { dot: "bg-[#22d68a]", variant: "default" };
  }
  if (action.includes("DELETE") || action.includes("REVOK")) {
    return { dot: "bg-[#e8485c]", variant: "destructive" };
  }
  if (action.includes("DECRYPT")) {
    return { dot: "bg-[#4a9eff]", variant: "blue" };
  }
  if (action.includes("UPDATE")) {
    return { dot: "bg-[#f0a744]", variant: "warning" };
  }
  return { dot: "bg-brand-text-muted", variant: "default" };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0 },
};

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  const displayLogs = logs.slice(0, 5);

  if (displayLogs.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-brand-text-secondary">
          Recent Activity
        </h3>
        <p className="text-sm text-brand-text-muted">
          No activity yet. Create a vault to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-brand-text-secondary">
        Recent Activity
      </h3>
      <motion.div
        className="relative space-y-0"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-brand-border" />

        {displayLogs.map((log) => {
          const { dot, variant } = getActionColor(log.action);

          return (
            <motion.div
              key={log.id}
              variants={itemVariants}
              className="relative flex items-start gap-3 py-2 pl-6"
            >
              {/* Dot */}
              <div
                className={cn(
                  "absolute left-[3px] top-[14px] h-[9px] w-[9px] rounded-full ring-2 ring-brand-card",
                  dot
                )}
              />

              <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Badge variant={variant} className="shrink-0">
                    {log.action.replace(/_/g, " ")}
                  </Badge>
                  {(log.service || log.keyName) && (
                    <span className="truncate font-mono text-xs text-brand-text-secondary">
                      {log.service}
                      {log.keyName ? `/${log.keyName}` : ""}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-xs text-brand-text-muted">
                  {formatDistanceToNow(new Date(log.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
      <Link
        href="/dashboard/audit"
        className="inline-flex items-center gap-1 text-sm text-brand-text-muted hover:text-brand-accent transition-colors"
      >
        View all activity
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
