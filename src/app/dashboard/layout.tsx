"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { CommandPalette } from "@/components/layout/command-palette";
import { ShortcutsDialog } from "@/components/shared/shortcuts-dialog";
import { SidebarProvider, useSidebarContext } from "@/components/providers/sidebar-provider";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const router = useRouter();

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K = Search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
        return;
      }

      // Cmd/Ctrl + N = Navigate to create vault
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        router.push("/dashboard/vaults");
        return;
      }

      // ? = Open shortcuts dialog
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }
    },
    [router]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Sidebar padding: use CSS classes to avoid hydration mismatch
  const paddingClass = collapsed
    ? "lg:pl-16"
    : "lg:pl-64";

  return (
    <div className="min-h-screen bg-brand-bg">
      <Sidebar />
      <div
        className={`transition-[padding] duration-200 ${paddingClass}`}
      >
        <Header onOpenSearch={() => setSearchOpen(true)} />
        <main className="px-4 py-8 pb-24 sm:px-6 md:pb-8 lg:px-8">
          {children}
        </main>
      </div>
      <BottomNav />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
