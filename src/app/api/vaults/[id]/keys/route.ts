import { NextResponse } from "next/server";

// DEPRECATED: Key creation now happens exclusively in the Lockbox extension.
// The dashboard no longer accepts plaintext key values (zero-knowledge architecture).
export async function POST() {
  return NextResponse.json(
    {
      error: "Gone",
      message:
        "Key creation has moved to the Lockbox extension. The dashboard no longer accepts plaintext key values.",
    },
    { status: 410 }
  );
}
