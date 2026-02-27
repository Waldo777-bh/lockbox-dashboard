"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AuditFiltersProps {
  onFilterChange: (filters: {
    action?: string;
    search?: string;
    since?: string;
  }) => void;
  actions: string[];
}

export function AuditFilters({ onFilterChange, actions }: AuditFiltersProps) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const computeSince = useCallback((range: string): string | undefined => {
    const now = new Date();
    switch (range) {
      case "today": {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        return start.toISOString();
      }
      case "7d": {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        return d.toISOString();
      }
      case "30d": {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        return d.toISOString();
      }
      default:
        return undefined;
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        action: action === "all" ? undefined : action,
        search: search.trim() || undefined,
        since: computeSince(dateRange),
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, action, dateRange, onFilterChange, computeSince]);

  function handleClear() {
    setSearch("");
    setAction("all");
    setDateRange("all");
  }

  async function handleExportCsv() {
    try {
      const res = await fetch("/api/audit/export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit-log.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail — user can retry
    }
  }

  const hasFilters = search !== "" || action !== "all" || dateRange !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Action filter */}
      <Select value={action} onValueChange={setAction}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Actions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Actions</SelectItem>
          {actions.map((a) => (
            <SelectItem key={a} value={a}>
              {a.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date range */}
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
        </SelectContent>
      </Select>

      {/* Export CSV */}
      <Button variant="outline" size="sm" onClick={handleExportCsv}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
