import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createVaultSchema } from "@/lib/validations";
import { createAuditLog, AuditAction } from "@/lib/audit";

// POST /api/vaults — Create a new vault
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const parsed = createVaultSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const vault = await db.vault.create({
      data: {
        name: parsed.data.name,
        userId: user.id,
      },
    });

    await createAuditLog({
      action: AuditAction.VAULT_CREATED,
      userId: user.id,
      metadata: { vaultName: vault.name },
    });

    return NextResponse.json(vault, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to create vault:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/vaults — List user's vaults
export async function GET() {
  try {
    const user = await getCurrentUser();

    const vaults = await db.vault.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { keys: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(vaults);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to list vaults:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
