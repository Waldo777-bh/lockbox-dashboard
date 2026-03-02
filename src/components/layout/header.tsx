"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Bell, Lock, Key, Puzzle } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { TierBadge } from "@/components/tier-badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onOpenSearch?: () => void;
  vaultName?: string;
}

function useBreadcrumbs(vaultName?: string) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { label: string; href: string }[] = [];

  for (let i = 0; i < segments.length; i++) {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const segment = segments[i];

    if (segment === "dashboard") {
      crumbs.push({ label: "Dashboard", href });
    } else if (segment === "vaults") {
      crumbs.push({ label: "Vaults", href });
    } else if (segment === "audit") {
      crumbs.push({ label: "Audit Log", href });
    } else if (segment === "api-keys") {
      crumbs.push({ label: "API Keys", href });
    } else if (segment === "extension-setup") {
      crumbs.push({ label: "Extension Setup", href });
    } else if (segment === "settings") {
      crumbs.push({ label: "Settings", href });
    } else if (i === segments.length - 1 && segments[i - 1] === "vaults") {
      crumbs.push({ label: vaultName || "Vault", href });
    }
  }

  return crumbs;
}

export function Header({ onOpenSearch, vaultName }: HeaderProps) {
  const crumbs = useBreadcrumbs(vaultName);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-brand-border bg-brand-bg/80 px-4 backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile nav trigger */}
      <MobileNav />

      {/* Separator (mobile only) */}
      <div className="h-6 w-px bg-brand-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Breadcrumbs */}
        <div className="flex flex-1 items-center">
          <Breadcrumb className="hidden sm:flex">
            <BreadcrumbList>
              {crumbs.map((crumb, i) => (
                <BreadcrumbItem key={crumb.href}>
                  {i > 0 && <BreadcrumbSeparator />}
                  {i === crumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-x-2 lg:gap-x-3">
          {/* Tier Badge */}
          <TierBadge variant="compact" />

          {/* Search */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 border-brand-border bg-brand-bg-secondary text-brand-text-muted hover:text-brand-text-secondary hover:bg-brand-card w-56 justify-start"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search...</span>
            <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-brand-border bg-brand-bg px-1.5 font-mono text-[10px] font-medium text-brand-text-muted sm:flex">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </Button>

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-brand-accent text-brand-bg hover:bg-brand-accent-dim"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/vaults" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  View Vaults
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/extension-setup" className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4" />
                  Setup Extension
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/api-keys" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Generate API Key
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-brand-text-muted hover:text-brand-text-secondary"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
