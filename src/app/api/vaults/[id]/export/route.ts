import { NextResponse } from "next/server";

/**
 * DEPRECATED — Vault export with decrypted keys has been removed.
 *
 * In the v2 zero-knowledge architecture, key values are only accessible
 * in the Lockbox extension wallet. The dashboard never stores or returns
 * plaintext key values.
 *
 * To export keys, use the Lockbox extension wallet.
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "Vault export has been removed in v2. Key values are only accessible in the Lockbox extension wallet.",
      docs: "https://yourlockbox.dev",
    },
    { status: 410 }
  );
}
