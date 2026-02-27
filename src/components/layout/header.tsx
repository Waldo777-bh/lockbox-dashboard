"use client";

import { UserButton } from "@clerk/nextjs";
import { MobileNav } from "./mobile-nav";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-brand-border bg-brand-bg/80 px-4 backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile nav trigger */}
      <MobileNav />

      {/* Separator (mobile only) */}
      <div className="h-6 w-px bg-brand-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          {title && (
            <h1 className="text-lg font-semibold text-brand-text">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
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
    </header>
  );
}
