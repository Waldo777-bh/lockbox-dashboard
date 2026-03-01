import { NextResponse } from "next/server";

// DEPRECATED: Key values are now managed exclusively in the Lockbox extension wallet.
// The dashboard no longer decrypts or returns key values (zero-knowledge architecture).
export async function GET() {
  return NextResponse.json(
    {
      error: "Gone",
      message:
        "Key decryption has been removed from the dashboard. Key values are now managed exclusively in the Lockbox extension wallet.",
    },
    { status: 410 }
  );
}
