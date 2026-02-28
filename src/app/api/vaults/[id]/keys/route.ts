import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createKeySchema } from "@/lib/validations";
import { encryptValue } from "@/lib/crypto";
import { createAuditLog, AuditAction } from "@/lib/audit";
import { checkKeyLimit } from "@/lib/tier";

// POST /api/vaults/[id]/keys — Add a key to a vault
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: vaultId } = await params;
    const body = await req.json();

    // Check tier key limit
    const limitCheck = await checkKeyLimit(user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, code: "TIER_LIMIT" },
        { status: 403 }
      );
    }

    // Verify vault ownership
    const vault = await db.vault.findFirst({
      where: { id: vaultId, userId: user.id },
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    // Validate input
    const parsed = createKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check for duplicates
    const existing = await db.key.findUnique({
      where: {
        vaultId_service_keyName: {
          vaultId,
          service: parsed.data.service,
          keyName: parsed.data.keyName,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A key with this service and name already exists in this vault" },
        { status: 409 }
      );
    }

    // Encrypt the value
    const { encryptedValue, iv, tag } = encryptValue(parsed.data.value);

    // Create the key
    const key = await db.key.create({
      data: {
        service: parsed.data.service,
        keyName: parsed.data.keyName,
        encryptedValue,
        iv,
        tag,
        project: parsed.data.project,
        notes: parsed.data.notes,
        vaultId,
      },
      select: {
        id: true,
        service: true,
        keyName: true,
        project: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog({
      action: AuditAction.KEY_ADDED,
      userId: user.id,
      service: parsed.data.service,
      keyName: parsed.data.keyName,
      metadata: { vaultName: vault.name },
    });

    return NextResponse.json(key, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to add key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
