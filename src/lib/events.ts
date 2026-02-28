/**
 * Lightweight event system for real-time UI updates after mutations.
 *
 * When a vault/key is created, edited, or deleted, the dialog emits an event.
 * Page components listen for these events and re-fetch data instantly —
 * no manual refresh needed.
 */

export type DataChangeEvent =
  | "vault:created"
  | "vault:updated"
  | "vault:deleted"
  | "key:created"
  | "key:updated"
  | "key:deleted";

const EVENT_NAME = "lockbox:data-changed";

interface DataChangeDetail {
  type: DataChangeEvent;
  vaultId?: string;
}

/** Emit a data-change event so listening pages can re-fetch */
export function emitDataChange(
  type: DataChangeEvent,
  vaultId?: string,
): void {
  window.dispatchEvent(
    new CustomEvent<DataChangeDetail>(EVENT_NAME, {
      detail: { type, vaultId },
    }),
  );
}

/** Subscribe to data-change events. Returns a cleanup function. */
export function onDataChange(
  callback: (detail: DataChangeDetail) => void,
): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<DataChangeDetail>;
    callback(custom.detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
