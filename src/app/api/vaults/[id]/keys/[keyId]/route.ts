import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog, AuditAction } from "@/lib/audit";

// DEPRECATED: Key updates now happen exclusively in the Lockbox extension.
// The dashboard no longer accepts plaintext key values (zero-knowledge architecture).
export async function PUT() {
  return NextResponse.json(
    {
      error: "Gone",
      message:
        "Key creation has moved to the Lockbox extension. The dashboard no longer accepts plaintext key values.",
    },
    { status: 410 }
  );
}

// DELETE /api/vaults/[id]/keys/[keyId] — Delete a key
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: vaultId, keyId } = await params;

    // Verify vault ownership
    const vault = await db.vault.findFirst({
      where: { id: vaultId, userId: user.id },
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    // Verify key exists
    const key = await db.key.findFirst({
      where: { id: keyId, vaultId },
    });

    if (!key) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    await db.key.delete({ where: { id: keyId } });

    await createAuditLog({
      action: AuditAction.KEY_DELETED,
      userId: user.id,
      service: key.service,
      keyName: key.keyName,
      metadata: { vaultName: vault.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to delete key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
