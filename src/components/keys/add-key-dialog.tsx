"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Eye, EyeOff } from "lucide-react";
import { emitDataChange } from "@/lib/events";
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

interface AddKeyDialogProps {
  vaultId: string;
}

export function AddKeyDialog({ vaultId }: AddKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [form, setForm] = useState({
    service: "",
    keyName: "",
    value: "",
    project: "",
    notes: "",
  });
  const router = useRouter();

  function resetForm() {
    setForm({ service: "", keyName: "", value: "", project: "", notes: "" });
    setShowValue(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.service || !form.keyName || !form.value) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/vaults/${vaultId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: form.service.trim(),
          keyName: form.keyName.trim(),
          value: form.value,
          project: form.project.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add key");
      }

      toast.success("Key added successfully");
      setOpen(false);
      resetForm();
      emitDataChange("key:created", vaultId);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add key"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Key</DialogTitle>
            <DialogDescription>
              Store an encrypted API key or secret in this vault.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service">Service</Label>
                <Input
                  id="service"
                  placeholder="e.g. openai"
                  value={form.service}
                  onChange={(e) =>
                    setForm({ ...form, service: e.target.value })
                  }
                  className="mt-1.5"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g. API_KEY"
                  value={form.keyName}
                  onChange={(e) =>
                    setForm({ ...form, keyName: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="value">Value</Label>
              <div className="relative mt-1.5">
                <Input
                  id="value"
                  type={showValue ? "text" : "password"}
                  placeholder="Enter the secret value"
                  value={form.value}
                  onChange={(e) =>
                    setForm({ ...form, value: e.target.value })
                  }
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowValue(!showValue)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text"
                >
                  {showValue ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="project">
                Project{" "}
                <span className="text-brand-text-muted">(optional)</span>
              </Label>
              <Input
                id="project"
                placeholder="e.g. myapp"
                value={form.project}
                onChange={(e) =>
                  setForm({ ...form, project: e.target.value })
                }
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="notes">
                Notes{" "}
                <span className="text-brand-text-muted">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this key"
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                className="mt-1.5"
                rows={2}
              />
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
            <Button
              type="submit"
              disabled={
                loading || !form.service || !form.keyName || !form.value
              }
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
