"use client";

import { useEffect, useCallback } from "react";

export interface KeyboardShortcut {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  handler: () => void;
}

/**
 * Registers global keyboard event listeners for the provided shortcuts.
 * Automatically handles Mac (metaKey) vs Windows (ctrlKey) when either
 * metaKey or ctrlKey is specified.
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore events when typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch =
          e.key.toLowerCase() === shortcut.key.toLowerCase();

        if (!keyMatch) continue;

        // If shortcut needs a modifier key (meta or ctrl), check platform-aware
        const needsModifier = shortcut.metaKey || shortcut.ctrlKey;
        if (needsModifier) {
          // Accept either metaKey (Mac) or ctrlKey (Windows/Linux)
          const hasModifier = e.metaKey || e.ctrlKey;
          if (!hasModifier) continue;
        }

        if (shortcut.shiftKey && !e.shiftKey) continue;

        e.preventDefault();
        shortcut.handler();
        return;
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
