import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateKeySchema } from "@/lib/validations";
import { encryptValue } from "@/lib/crypto";
import { createAuditLog, AuditAction } from "@/lib/audit";

// PUT /api/vaults/[id]/keys/[keyId] — Update a key
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; keyId: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id: vaultId, keyId } = await params;
    const body = await req.json();

    // Verify vault ownership
    const vault = await db.vault.findFirst({
      where: { id: vaultId, userId: user.id },
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    // Verify key exists in vault
    const existingKey = await db.key.findFirst({
      where: { id: keyId, vaultId },
    });

    if (!existingKey) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }

    // Validate input
    const parsed = updateKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (parsed.data.service !== undefined) updateData.service = parsed.data.service;
    if (parsed.data.keyName !== undefined) updateData.keyName = parsed.data.keyName;
    if (parsed.data.project !== undefined) updateData.project = parsed.data.project;
    if (parsed.data.notes !== undefined) updateData.notes = parsed.data.notes;

    // Re-encrypt if value changed
    if (parsed.data.value) {
      const encrypted = encryptValue(parsed.data.value);
      updateData.encryptedValue = encrypted.encryptedValue;
      updateData.iv = encrypted.iv;
      updateData.tag = encrypted.tag;
    }

    const updatedKey = await db.key.update({
      where: { id: keyId },
      data: updateData,
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
      action: AuditAction.KEY_UPDATED,
      userId: user.id,
      service: updatedKey.service,
      keyName: updatedKey.keyName,
      metadata: { vaultName: vault.name },
    });

    return NextResponse.json(updatedKey);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to update key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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
