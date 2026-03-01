"use client";

import { motion } from "framer-motion";
import { Key } from "lucide-react";

const SERVICE_COLORS: Record<string, string> = {
  openai: "#10a37f",
  anthropic: "#d97706",
  stripe: "#635bff",
  aws: "#ff9900",
  github: "#f0f6fc",
  vercel: "#ffffff",
  supabase: "#3ecf8e",
  firebase: "#ffca28",
  clerk: "#6c47ff",
  cloudflare: "#f38020",
  twilio: "#f22f46",
  sendgrid: "#1a82e2",
  netlify: "#00c7b7",
  digitalocean: "#0080ff",
  heroku: "#430098",
  neon: "#00e599",
  planetscale: "#000000",
  resend: "#ffffff",
  railway: "#a855f7",
};

function getServiceColor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, color] of Object.entries(SERVICE_COLORS)) {
    if (lower.includes(key)) return color;
  }
  // Generate a deterministic color from the service name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 55%)`;
}

interface ServiceCardProps {
  name: string;
  keyCount: number;
  keyNames: string[];
  color?: string;
}

export function ServiceCard({
  name,
  keyCount,
  keyNames,
  color,
}: ServiceCardProps) {
  const serviceColor = color || getServiceColor(name);
  const initial = name.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-lg border border-brand-border bg-brand-card transition-all duration-200 hover:border-brand-border-bright hover:shadow-[0_0_20px_rgba(34,214,138,0.06)]"
    >
      {/* Colored left border */}
      <div
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: serviceColor }}
      />

      <div className="p-4 pl-5">
        <div className="flex items-start justify-between gap-3">
          {/* Service icon and name */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
              style={{
                backgroundColor: `${serviceColor}15`,
                color: serviceColor,
              }}
            >
              {initial}
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-text">{name}</p>
              <p className="flex items-center gap-1 text-xs text-brand-text-secondary">
                <Key className="h-3 w-3" />
                {keyCount} key{keyCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Key names list */}
        {keyNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {keyNames.slice(0, 5).map((keyName) => (
              <span
                key={keyName}
                className="inline-flex items-center rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 font-mono text-xs text-brand-text-secondary"
              >
                {keyName}
              </span>
            ))}
            {keyNames.length > 5 && (
              <span className="inline-flex items-center rounded-md border border-brand-border bg-brand-bg px-2 py-0.5 text-xs text-brand-text-muted">
                +{keyNames.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
