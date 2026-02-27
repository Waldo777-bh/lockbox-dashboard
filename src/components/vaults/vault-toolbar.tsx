"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VaultToolbarProps {
  onSearch: (q: string) => void;
  onSortChange: (sort: string) => void;
  onViewChange: (view: "grid" | "list") => void;
  view: "grid" | "list";
  sort: string;
}

const STORAGE_KEY = "lockbox-vault-view";

export function VaultToolbar({
  onSearch,
  onSortChange,
  onViewChange,
  view,
  sort,
}: VaultToolbarProps) {
  const [searchValue, setSearchValue] = useState("");

  // Persist view preference in localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "grid" || stored === "list") {
      onViewChange(stored);
    }
  }, [onViewChange]);

  const handleViewChange = (newView: "grid" | "list") => {
    localStorage.setItem(STORAGE_KEY, newView);
    onViewChange(newView);
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, onSearch]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
        <Input
          placeholder="Search vaults..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Last Updated</SelectItem>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="keyCount">Key Count</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-md border border-brand-border bg-brand-bg-secondary">
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-r-none ${
              view === "grid"
                ? "bg-brand-card-hover text-brand-text"
                : "text-brand-text-muted"
            }`}
            onClick={() => handleViewChange("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="sr-only">Grid view</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-l-none ${
              view === "list"
                ? "bg-brand-card-hover text-brand-text"
                : "text-brand-text-muted"
            }`}
            onClick={() => handleViewChange("list")}
          >
            <List className="h-4 w-4" />
            <span className="sr-only">List view</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
