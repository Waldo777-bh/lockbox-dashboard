"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Lock,
  Link2,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Shield,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/layout/page-transition";
import { CopyButton } from "@/components/shared/copy-button";

interface StepProps {
  number: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  isLast?: boolean;
}

function Step({ number, icon: Icon, title, children, isLast }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: number * 0.1 }}
      className="relative flex gap-5"
    >
      {/* Vertical stepper line */}
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-brand-accent bg-brand-accent/10">
          <span className="text-sm font-bold text-brand-accent">{number}</span>
        </div>
        {!isLast && (
          <div className="mt-2 w-0.5 flex-1 bg-brand-border" />
        )}
      </div>

      {/* Step content card */}
      <div className="mb-8 flex-1 rounded-lg border border-brand-border bg-brand-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-accent/10">
            <Icon className="h-5 w-5 text-brand-accent" />
          </div>
          <h3 className="text-lg font-semibold text-brand-text">{title}</h3>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

export default function ExtensionSetupPage() {
  const [token, setToken] = useState<string | null>(null);
  const [generatingToken, setGeneratingToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  async function handleGenerateToken() {
    setGeneratingToken(true);
    setTokenError(null);
    try {
      const res = await fetch("/api/auth/extension-token", {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate token");
      }
      const data = await res.json();
      setToken(data.token);
      toast.success("Connection token generated");
    } catch (err: any) {
      setTokenError(err.message || "Failed to generate token");
      toast.error("Failed to generate token");
    } finally {
      setGeneratingToken(false);
    }
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-brand-text">
            Extension Setup
          </h2>
          <p className="mt-1 text-brand-text-secondary">
            Get started with the Lockbox browser extension in 4 simple steps
          </p>
        </div>

        {/* Steps */}
        <div>
          {/* Step 1: Install the Extension */}
          <Step number={1} icon={Download} title="Install the Extension">
            <p className="mb-4 text-sm text-brand-text-secondary">
              Install the Lockbox extension from the Chrome Web Store to manage
              your API keys directly in the browser.
            </p>

            <Button asChild className="mb-4">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-4 w-4" />
                Install from Chrome Web Store
                <ExternalLink className="ml-2 h-3 w-3 opacity-50" />
              </a>
            </Button>

            <div className="rounded-lg border border-brand-border bg-brand-bg p-4">
              <p className="mb-2 text-xs font-medium text-brand-text-secondary">
                Or load from developer build:
              </p>
              <ol className="space-y-1.5 text-xs text-brand-text-muted">
                <li className="flex gap-2">
                  <span className="font-mono text-brand-accent">1.</span>
                  <span>
                    Clone the repo and run{" "}
                    <code className="rounded bg-brand-card px-1.5 py-0.5 font-mono text-brand-text-secondary">
                      npm run build
                    </code>
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-brand-accent">2.</span>
                  <span>
                    Open{" "}
                    <code className="rounded bg-brand-card px-1.5 py-0.5 font-mono text-brand-text-secondary">
                      chrome://extensions
                    </code>{" "}
                    and enable Developer Mode
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-brand-accent">3.</span>
                  <span>
                    Click &quot;Load unpacked&quot; and select the{" "}
                    <code className="rounded bg-brand-card px-1.5 py-0.5 font-mono text-brand-text-secondary">
                      dist/
                    </code>{" "}
                    folder
                  </span>
                </li>
              </ol>
            </div>

            {/* Screenshot placeholder */}
            <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed border-brand-border bg-brand-bg">
              <p className="text-xs text-brand-text-muted">
                Extension screenshot preview
              </p>
            </div>
          </Step>

          {/* Step 2: Create Your Wallet */}
          <Step number={2} icon={Lock} title="Create Your Wallet">
            <p className="mb-4 text-sm text-brand-text-secondary">
              When you first open the extension, you will be prompted to create a
              secure wallet protected by a master password.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-brand-bg p-3">
                <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-accent" />
                <div>
                  <p className="text-sm font-medium text-brand-text">
                    AES-256-GCM Encryption
                  </p>
                  <p className="mt-0.5 text-xs text-brand-text-muted">
                    Your master password encrypts all keys using
                    military-grade AES-256-GCM encryption. The password itself
                    is never stored.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-brand-bg p-3">
                <Key className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-accent" />
                <div>
                  <p className="text-sm font-medium text-brand-text">
                    12-Word Recovery Phrase
                  </p>
                  <p className="mt-0.5 text-xs text-brand-text-muted">
                    A BIP-39 recovery phrase is generated as a backup.
                    Write it down and store it in a safe place. This is
                    the only way to recover your wallet if you forget your
                    password.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-3">
                <p className="text-xs font-medium text-brand-accent">
                  Your keys never leave your device
                </p>
                <p className="mt-0.5 text-xs text-brand-text-muted">
                  All encryption and decryption happens locally. The
                  dashboard only receives encrypted metadata for display
                  purposes.
                </p>
              </div>
            </div>
          </Step>

          {/* Step 3: Connect to Dashboard */}
          <Step number={3} icon={Link2} title="Connect to Dashboard">
            <p className="mb-4 text-sm text-brand-text-secondary">
              Generate a connection token to link your extension to this
              dashboard. This enables vault summaries and audit logging.
            </p>

            {!token ? (
              <div className="space-y-3">
                <Button
                  onClick={handleGenerateToken}
                  disabled={generatingToken}
                >
                  {generatingToken ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Generate Connection Token
                    </>
                  )}
                </Button>

                {tokenError && (
                  <p className="text-sm text-red-400">{tokenError}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-brand-border bg-brand-bg p-3">
                  <code className="flex-1 break-all font-mono text-sm text-brand-accent">
                    {token}
                  </code>
                  <CopyButton value={token} />
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                  <p className="text-xs text-yellow-200/80">
                    This token expires in 24 hours. Generate a new one if it
                    expires before you connect.
                  </p>
                </div>

                <div className="rounded-lg bg-brand-bg p-3">
                  <p className="text-xs font-medium text-brand-text-secondary">
                    Next steps:
                  </p>
                  <ol className="mt-1.5 space-y-1 text-xs text-brand-text-muted">
                    <li>
                      1. Open the Lockbox extension popup
                    </li>
                    <li>
                      2. Go to{" "}
                      <span className="font-medium text-brand-text-secondary">
                        Settings &gt; Dashboard Connection
                      </span>
                    </li>
                    <li>
                      3. Paste the token above and click Connect
                    </li>
                  </ol>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setToken(null);
                    setTokenError(null);
                  }}
                >
                  Generate New Token
                </Button>
              </div>
            )}
          </Step>

          {/* Step 4: Start Adding Keys */}
          <Step number={4} icon={Key} title="Start Adding Keys" isLast>
            <p className="mb-4 text-sm text-brand-text-secondary">
              Once connected, you can begin adding API keys to your vault.
              Lockbox supports multiple methods for importing keys.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg bg-brand-bg p-3">
                <FileCode className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-accent" />
                <div>
                  <p className="text-sm font-medium text-brand-text">
                    Auto-Detect on 20+ Platforms
                  </p>
                  <p className="mt-0.5 text-xs text-brand-text-muted">
                    Lockbox automatically detects API key fields on OpenAI,
                    Stripe, AWS, GitHub, Anthropic, Vercel, and many more.
                    Just click the Lockbox icon when prompted.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-brand-bg p-3">
                <Key className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-accent" />
                <div>
                  <p className="text-sm font-medium text-brand-text">
                    Manual Add
                  </p>
                  <p className="mt-0.5 text-xs text-brand-text-muted">
                    Open the extension popup, click &quot;Add Key&quot;, and
                    enter the service name, key name, and value. Keys are
                    encrypted before being stored.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-brand-bg p-3">
                <Download className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-accent" />
                <div>
                  <p className="text-sm font-medium text-brand-text">
                    .env File Import
                  </p>
                  <p className="mt-0.5 text-xs text-brand-text-muted">
                    Import keys from a .env file directly into a vault. The
                    file is parsed locally and never uploaded.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-brand-accent/20 bg-brand-accent/5 p-3">
                <p className="text-xs font-medium text-brand-accent">
                  Your keys are encrypted locally — we never see them
                </p>
                <p className="mt-0.5 text-xs text-brand-text-muted">
                  All key values are encrypted with your master password
                  using AES-256-GCM before being stored. Only encrypted
                  metadata is synced to the dashboard.
                </p>
              </div>
            </div>
          </Step>
        </div>
      </div>
    </PageTransition>
  );
}
