import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { decryptValue } from "@/lib/crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAuditLog, AuditAction } from "@/lib/audit";

// GET /api/vaults/[id]/export — Export vault with decrypted keys
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    // Rate limit check
    const rateLimit = checkRateLimit(user.id);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
          },
        }
      );
    }

    const vault = await db.vault.findFirst({
      where: { id, userId: user.id },
      include: {
        keys: true,
      },
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    // Decrypt all key values
    const decryptedKeys = vault.keys.map((key) => {
      const decryptedValue = decryptValue(key.encryptedValue, key.iv, key.tag);
      return {
        id: key.id,
        service: key.service,
        keyName: key.keyName,
        value: decryptedValue,
        project: key.project,
        notes: key.notes,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
      };
    });

    await createAuditLog({
      action: AuditAction.VAULT_EXPORTED,
      userId: user.id,
      metadata: {
        vaultName: vault.name,
        vaultId: vault.id,
        keyCount: vault.keys.length,
      },
    });

    return NextResponse.json({
      vault: {
        id: vault.id,
        name: vault.name,
        description: vault.description,
        color: vault.color,
        emoji: vault.emoji,
        createdAt: vault.createdAt,
        updatedAt: vault.updatedAt,
      },
      keys: decryptedKeys,
      exportedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to export vault:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
