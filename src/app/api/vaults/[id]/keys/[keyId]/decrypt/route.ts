import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { decryptValue } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAuditLog, AuditAction } from "@/lib/audit";

// GET /api/vaults/[id]/keys/[keyId]/decrypt — Decrypt and return key value
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: vaultId, keyId } = await params;

    // Rate limit
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Try again later.",
          resetAt: rateLimit.resetAt,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    // Verify vault ownership
    const vault = await db.vault.findFirst({
      where: { id: vaultId, userId: user.id },
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    // Get key with encrypted data
    const key = await db.key.findFirst({
      where: { id: keyId, vaultId },
    });

    if (!key) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    // Decrypt
    const value = decryptValue(key.encryptedValue, key.iv, key.tag);

    // Audit log
    await createAuditLog({
      action: AuditAction.KEY_DECRYPTED,
      userId: user.id,
      service: key.service,
      keyName: key.keyName,
      metadata: { vaultName: vault.name },
    });

    return NextResponse.json(
      { value },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to decrypt key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
