"use client";

import { useEffect } from "react";
import { onDataChange, type DataChangeEvent } from "@/lib/events";

/**
 * Hook that listens for data-change events and calls the refresh callback.
 * Optionally filter by event types or vaultId.
 */
export function useDataRefresh(
  refresh: () => void,
  options?: {
    /** Only react to specific event types */
    types?: DataChangeEvent[];
    /** Only react to events for a specific vault */
    vaultId?: string;
  },
): void {
  useEffect(() => {
    const cleanup = onDataChange((detail) => {
      // Filter by types if specified
      if (options?.types && !options.types.includes(detail.type)) {
        return;
      }
      // Filter by vaultId if specified
      if (options?.vaultId && detail.vaultId && detail.vaultId !== options.vaultId) {
        return;
      }
      refresh();
    });
    return cleanup;
  }, [refresh, options?.types, options?.vaultId]);
}
