"use client";

import { Chrome, Download, Puzzle, KeyRound, Search, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/lockbox-api-key-vault/bcjcdgpmgmbibgngbkhfobidmnfddefa";

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-accent/10 text-brand-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-brand-text">{title}</h4>
        <p className="mt-0.5 text-xs text-brand-text-secondary">{description}</p>
      </div>
    </div>
  );
}

export function BrowserExtension() {
  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="flex items-start gap-4 rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand-accent/10 border border-brand-accent/20">
          <Lock className="h-6 w-6 text-brand-accent" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-brand-text">
            Lockbox for Chrome
          </h3>
          <p className="mt-1 text-sm text-brand-text-secondary">
            Access, copy, and auto-fill your API keys directly from the browser
            toolbar. No more switching tabs to find your keys.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" asChild>
              <a
                href={CHROME_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Chrome className="mr-2 h-4 w-4" />
                Add to Chrome
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/Waldo777-bh/lockbox-extension"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Features */}
      <div>
        <h4 className="text-sm font-medium text-brand-text-secondary mb-3">
          Features
        </h4>
        <div className="grid gap-4">
          <Feature
            icon={Search}
            title="Instant search"
            description="Open the popup and start typing to find any key across all your vaults."
          />
          <Feature
            icon={Puzzle}
            title="Auto-detect API key fields"
            description="Detects API key inputs on OpenAI, Stripe, AWS, GitHub, Anthropic, and more. Click the Lockbox icon to fill."
          />
          <Feature
            icon={KeyRound}
            title="Context menu paste"
            description="Right-click any input field and paste a key directly from your vault."
          />
          <Feature
            icon={Chrome}
            title="Omnibox search"
            description='Type "lb" in the address bar, press Tab, then search to copy a key instantly.'
          />
        </div>
      </div>

      <Separator />

      {/* How it works */}
      <div>
        <h4 className="text-sm font-medium text-brand-text-secondary mb-3">
          How it works
        </h4>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-bg-tertiary text-xs font-medium text-brand-text-secondary">
              1
            </span>
            <span className="text-brand-text-secondary">
              Click <strong className="text-brand-text">Add to Chrome</strong> above and confirm the install
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-bg-tertiary text-xs font-medium text-brand-text-secondary">
              2
            </span>
            <span className="text-brand-text-secondary">
              Click the Lockbox icon in your toolbar and sign in
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-bg-tertiary text-xs font-medium text-brand-text-secondary">
              3
            </span>
            <span className="text-brand-text-secondary">
              Search, copy, and auto-fill your keys from anywhere
            </span>
          </li>
        </ol>
      </div>

      {/* Keyboard shortcut note */}
      <div className="rounded-lg border border-brand-border bg-brand-card p-3">
        <p className="text-xs text-brand-text-muted">
          <strong className="text-brand-text-secondary">Tip:</strong> Press{" "}
          <kbd className="rounded border border-brand-border bg-brand-bg px-1.5 py-0.5 font-mono text-[10px] text-brand-text-secondary">
            Alt+Shift+L
          </kbd>{" "}
          to open Lockbox from anywhere in the browser.
        </p>
      </div>
    </div>
  );
}
