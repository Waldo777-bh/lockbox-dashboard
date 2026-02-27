"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Lock,
  ScrollText,
  KeyRound,
  Settings,
  Plus,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VaultResult {
  id: string;
  name: string;
  _count: { keys: number };
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [vaults, setVaults] = useState<VaultResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Search vaults when query changes
  useEffect(() => {
    if (!open || query.length < 1) {
      setVaults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/vaults?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setVaults(data);
        }
      } catch {
        // Ignore abort errors
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, open]);

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search vaults, keys, or type a command..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Searching..." : "No results found."}
        </CommandEmpty>

        {/* Vault search results */}
        {vaults.length > 0 && (
          <CommandGroup heading="Vaults">
            {vaults.map((vault) => (
              <CommandItem
                key={vault.id}
                onSelect={() =>
                  runCommand(() =>
                    router.push(`/dashboard/vaults/${vault.id}`)
                  )
                }
              >
                <Lock className="mr-2 h-4 w-4 text-brand-accent" />
                <span>{vault.name}</span>
                <span className="ml-auto text-xs text-brand-text-muted">
                  {vault._count.keys} keys
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard"))
            }
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/vaults"))
            }
          >
            <Lock className="mr-2 h-4 w-4" />
            Vaults
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/audit"))
            }
          >
            <ScrollText className="mr-2 h-4 w-4" />
            Audit Log
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/api-keys"))
            }
          >
            <KeyRound className="mr-2 h-4 w-4" />
            API Keys
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/settings"))
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/vaults"))
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Vault
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => router.push("/dashboard/api-keys"))
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Generate API Key
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
