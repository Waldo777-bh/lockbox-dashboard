"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-border bg-brand-bg-secondary pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1.5 transition-colors",
                isActive
                  ? "text-brand-accent"
                  : "text-brand-text-muted hover:text-brand-text-secondary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-brand-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
