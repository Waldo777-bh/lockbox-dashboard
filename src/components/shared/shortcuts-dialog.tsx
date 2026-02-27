"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutEntry {
  keys: string[];
  description: string;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutEntry[];
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["\u2318", "K"], description: "Open search" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["\u2318", "N"], description: "New vault" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["Esc"], description: "Close dialog / panel" },
      { keys: ["?"], description: "Show keyboard shortcuts" },
    ],
  },
];

export function ShortcutsDialog({ open, onOpenChange }: ShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate quickly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-text-muted">
                {group.title}
              </h4>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.description}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-brand-text-secondary">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, idx) => (
                        <span key={idx}>
                          <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded border border-brand-border bg-brand-bg-secondary px-1.5 font-mono text-xs font-medium text-brand-text-secondary">
                            {key}
                          </kbd>
                          {idx < shortcut.keys.length - 1 && (
                            <span className="mx-0.5 text-brand-text-muted">
                              +
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-center text-xs text-brand-text-muted">
          On Windows / Linux, use Ctrl instead of {"\u2318"}
        </p>
      </DialogContent>
    </Dialog>
  );
}
