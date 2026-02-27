"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 gap-1.5 text-xs text-brand-text-muted hover:text-brand-text"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-brand-accent" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </Button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative mt-2 rounded-md border border-brand-border bg-brand-bg">
      <div className="flex items-center justify-between border-b border-brand-border px-3 py-1.5">
        <span className="text-xs text-brand-text-muted">Terminal</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-3">
        <code className="font-mono text-sm text-brand-text">{code}</code>
      </pre>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  children: React.ReactNode;
}

function Step({ number, title, description, children }: StepProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-bold text-brand-bg">
          {number}
        </div>
        <div className="mt-2 flex-1 border-l border-brand-border" />
      </div>
      <div className="flex-1 pb-8">
        <h4 className="text-base font-semibold text-brand-text">{title}</h4>
        <p className="mt-1 text-sm text-brand-text-secondary">{description}</p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

const mcpConfig = `{
  "mcpServers": {
    "lockbox": {
      "command": "npx",
      "args": ["lockbox-mcp"]
    }
  }
}`;

export function CliSetup() {
  return (
    <div className="space-y-2">
      <Step
        number={1}
        title="Install CLI"
        description="Install the Lockbox CLI globally via npm."
      >
        <CodeBlock code="npm install -g lockbox-vault" />
      </Step>

      <Step
        number={2}
        title="Generate API Key"
        description="Create an API key to authenticate the CLI with your account."
      >
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/api-keys">
            <ExternalLink className="mr-2 h-4 w-4" />
            Go to API Keys
          </Link>
        </Button>
      </Step>

      <Step
        number={3}
        title="MCP Config"
        description="Add the following to your Claude Code or Cursor MCP configuration."
      >
        <div className="relative mt-2 rounded-md border border-brand-border bg-brand-bg">
          <div className="flex items-center justify-between border-b border-brand-border px-3 py-1.5">
            <span className="text-xs text-brand-text-muted">JSON</span>
            <CopyButton text={mcpConfig} />
          </div>
          <pre className="overflow-x-auto p-3">
            <code className="font-mono text-sm text-brand-text">
              {mcpConfig}
            </code>
          </pre>
        </div>
      </Step>

      <Step
        number={4}
        title="Test It"
        description="Verify everything works by fetching a secret from your vault."
      >
        <CodeBlock code="lockbox get openai API_KEY" />
      </Step>
    </div>
  );
}
