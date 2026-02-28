"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Check } from "lucide-react";
import { emitDataChange } from "@/lib/events";
import {
  Lock,
  Key,
  Shield,
  Database,
  Cloud,
  Server,
  Code,
  Globe,
  Zap,
  Folder,
  Star,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const COLOR_PRESETS = [
  { value: "#22d68a", label: "Green" },
  { value: "#4a9eff", label: "Blue" },
  { value: "#9b7aff", label: "Purple" },
  { value: "#f0a744", label: "Orange" },
  { value: "#e8485c", label: "Red" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#eab308", label: "Yellow" },
];

const emojiIconMap: Record<string, LucideIcon> = {
  lock: Lock,
  key: Key,
  shield: Shield,
  database: Database,
  cloud: Cloud,
  server: Server,
  code: Code,
  globe: Globe,
  zap: Zap,
  folder: Folder,
  star: Star,
  heart: Heart,
};

const EMOJI_OPTIONS = Object.keys(emojiIconMap);

export function CreateVaultDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#22d68a");
  const [emoji, setEmoji] = useState("lock");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function resetForm() {
    setName("");
    setDescription("");
    setColor("#22d68a");
    setEmoji("lock");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/vaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          color,
          emoji,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create vault");
      }

      toast.success("Vault created successfully");
      setOpen(false);
      resetForm();
      emitDataChange("vault:created");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create vault"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Vault
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Vault</DialogTitle>
            <DialogDescription>
              Create a vault to organize your API keys and secrets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <Label htmlFor="vault-name">Vault Name</Label>
              <Input
                id="vault-name"
                placeholder="e.g. Production, Staging, Personal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2"
                autoFocus
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="vault-description">Description</Label>
              <Textarea
                id="vault-description"
                placeholder="Optional description for this vault..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2"
                rows={2}
              />
            </div>

            {/* Color Picker */}
            <div>
              <Label>Color</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: preset.value,
                      borderColor:
                        color === preset.value
                          ? "white"
                          : "transparent",
                    }}
                    onClick={() => setColor(preset.value)}
                    title={preset.label}
                  >
                    {color === preset.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Emoji Picker */}
            <div>
              <Label>Icon</Label>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {EMOJI_OPTIONS.map((emojiKey) => {
                  const Icon = emojiIconMap[emojiKey];
                  return (
                    <button
                      key={emojiKey}
                      type="button"
                      className={`flex h-10 w-10 items-center justify-center rounded-md border transition-colors ${
                        emoji === emojiKey
                          ? "border-brand-accent bg-brand-accent/10"
                          : "border-brand-border bg-brand-bg-secondary hover:bg-brand-card-hover"
                      }`}
                      onClick={() => setEmoji(emojiKey)}
                      title={emojiKey}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{
                          color: emoji === emojiKey ? color : undefined,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Vault
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
