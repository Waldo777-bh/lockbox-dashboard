import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateVaultSchema } from "@/lib/validations";
import { createAuditLog, AuditAction } from "@/lib/audit";

// GET /api/vaults/[id] — Get vault with keys
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const vault = await db.vault.findFirst({
      where: { id, userId: user.id },
      include: {
        keys: {
          select: {
            id: true,
            service: true,
            keyName: true,
            project: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { service: "asc" },
        },
      },
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    return NextResponse.json(vault);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to get vault:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/vaults/[id] — Update vault
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await req.json();

    const parsed = updateVaultSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const vault = await db.vault.findFirst({
      where: { id, userId: user.id },
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    const updatedVault = await db.vault.update({
      where: { id },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && {
          description: parsed.data.description,
        }),
        ...(parsed.data.color !== undefined && { color: parsed.data.color }),
        ...(parsed.data.emoji !== undefined && { emoji: parsed.data.emoji }),
      },
    });

    await createAuditLog({
      action: AuditAction.VAULT_UPDATED,
      userId: user.id,
      metadata: {
        vaultName: updatedVault.name,
        updatedFields: Object.keys(parsed.data),
      },
    });

    return NextResponse.json(updatedVault);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to update vault:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/vaults/[id] — Delete vault (cascade deletes keys)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const vault = await db.vault.findFirst({
      where: { id, userId: user.id },
    });

    if (!vault) {
      return NextResponse.json({ error: "Vault not found" }, { status: 404 });
    }

    await db.vault.delete({ where: { id } });

    await createAuditLog({
      action: AuditAction.VAULT_DELETED,
      userId: user.id,
      metadata: { vaultName: vault.name },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to delete vault:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
