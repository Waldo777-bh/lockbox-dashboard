import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CliStatusProps {
  hasApiKeys: boolean;
  lastCliUsed?: Date | null;
}

export function CliStatus({ hasApiKeys, lastCliUsed }: CliStatusProps) {
  const isConnected = hasApiKeys && lastCliUsed;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-card p-4">
      <Terminal className="h-4 w-4 text-brand-text-muted" />
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-brand-accent" : "bg-brand-text-muted"
          )}
        />
        {isConnected ? (
          <span className="text-sm text-brand-text-secondary">
            CLI Connected{" "}
            <span className="text-brand-text-muted">
              &middot;{" "}
              {formatDistanceToNow(new Date(lastCliUsed), {
                addSuffix: true,
              })}
            </span>
          </span>
        ) : (
          <span className="text-sm text-brand-text-muted">
            CLI Not Connected{" "}
            <span className="text-brand-text-muted">&middot;</span>{" "}
            <Link
              href="/dashboard/settings"
              className="text-brand-accent hover:underline"
            >
              Set up CLI access
            </Link>
          </span>
        )}
      </div>
    </div>
  );
}
