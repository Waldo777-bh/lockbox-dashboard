"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { TierBadge } from "@/components/tier-badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-brand-bg-secondary p-0">
        <SheetHeader className="px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent">
              <Lock className="h-4 w-4 text-brand-bg" />
            </div>
            <span className="font-mono text-lg font-bold text-brand-text">
              Lockbox
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="px-4">
          <ul className="flex flex-col gap-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "border-l-2 border-brand-accent bg-brand-accent/10 text-brand-accent"
                        : "border-l-2 border-transparent text-brand-text-secondary hover:bg-brand-card hover:text-brand-text"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tier Badge */}
        <div className="mt-4 px-6">
          <TierBadge />
        </div>
      </SheetContent>
    </Sheet>
  );
}
