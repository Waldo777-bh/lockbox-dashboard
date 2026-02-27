"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ChevronsLeft, ChevronsRight } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation";
import { useSidebarContext } from "@/components/providers/sidebar-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarContext();

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col border-r border-brand-border bg-brand-bg-secondary"
        animate={{ width: collapsed ? 64 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-2 px-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-accent">
              <Lock className="h-4 w-4 text-brand-bg" />
            </div>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-lg font-bold text-brand-text whitespace-nowrap"
              >
                Lockbox
              </motion.span>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3">
            <nav className="flex flex-col gap-y-1 py-2">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "border-l-2 border-brand-accent bg-brand-accent/10 text-brand-accent"
                        : "border-l-2 border-transparent text-brand-text-secondary hover:bg-brand-card hover:text-brand-text"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive
                          ? "text-brand-accent"
                          : "text-brand-text-muted group-hover:text-brand-text-secondary"
                      )}
                    />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <div key={item.href}>{linkContent}</div>;
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-brand-border p-3">
            {/* Collapse Toggle */}
            <button
              onClick={toggle}
              className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm text-brand-text-muted transition-colors hover:bg-brand-card hover:text-brand-text-secondary"
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronsLeft className="h-4 w-4" />
                  <span className="whitespace-nowrap">Collapse</span>
                </>
              )}
            </button>

            {/* User */}
            <div
              className={cn(
                "mt-2 flex items-center gap-3 rounded-md px-3 py-2",
                collapsed && "justify-center px-0"
              )}
            >
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
