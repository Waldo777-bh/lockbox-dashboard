"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Eye, EyeOff } from "lucide-react";
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

interface EditKeyDialogProps {
  vaultId: string;
  keyId: string;
  currentService: string;
  currentKeyName: string;
  currentProject: string | null;
  currentNotes: string | null;
}

export function EditKeyDialog({
  vaultId,
  keyId,
  currentService,
  currentKeyName,
  currentProject,
  currentNotes,
}: EditKeyDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showValue, setShowValue] = useState(false);
  const [form, setForm] = useState({
    service: currentService,
    keyName: currentKeyName,
    value: "",
    project: currentProject ?? "",
    notes: currentNotes ?? "",
  });
  const router = useRouter();

  function resetForm() {
    setForm({
      service: currentService,
      keyName: currentKeyName,
      value: "",
      project: currentProject ?? "",
      notes: currentNotes ?? "",
    });
    setShowValue(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    try {
      const body: Record<string, string | undefined | null> = {};
      if (form.service !== currentService) body.service = form.service;
      if (form.keyName !== currentKeyName) body.keyName = form.keyName;
      if (form.value) body.value = form.value;
      body.project = form.project.trim() || null;
      body.notes = form.notes.trim() || null;

      const res = await fetch(`/api/vaults/${vaultId}/keys/${keyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update key");
      }

      toast.success("Key updated successfully");
      setOpen(false);
      emitDataChange("key:updated", vaultId);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update key"
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
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Key</DialogTitle>
            <DialogDescription>
              Update the details for {currentService}/{currentKeyName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-service">Service</Label>
                <Input
                  id="edit-service"
                  value={form.service}
                  onChange={(e) =>
                    setForm({ ...form, service: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-keyName">Key Name</Label>
                <Input
                  id="edit-keyName"
                  value={form.keyName}
                  onChange={(e) =>
                    setForm({ ...form, keyName: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-value">
                New Value{" "}
                <span className="text-brand-text-muted">
                  (leave empty to keep current)
                </span>
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="edit-value"
                  type={showValue ? "text" : "password"}
                  placeholder="Enter new value or leave empty"
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
              <Label htmlFor="edit-project">
                Project{" "}
                <span className="text-brand-text-muted">(optional)</span>
              </Label>
              <Input
                id="edit-project"
                placeholder="e.g. myapp"
                value={form.project}
                onChange={(e) =>
                  setForm({ ...form, project: e.target.value })
                }
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="edit-notes">
                Notes{" "}
                <span className="text-brand-text-muted">(optional)</span>
              </Label>
              <Textarea
                id="edit-notes"
                placeholder="Any additional notes"
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
