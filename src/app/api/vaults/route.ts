import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createVaultSchema } from "@/lib/validations";
import { createAuditLog, AuditAction } from "@/lib/audit";
import { checkVaultLimit } from "@/lib/tier";

// POST /api/vaults — Create a new vault
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    // Check tier vault limit
    const limitCheck = await checkVaultLimit(user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.message, code: "TIER_LIMIT" },
        { status: 403 }
      );
    }

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
        description: parsed.data.description ?? null,
        color: parsed.data.color ?? "#22d68a",
        emoji: parsed.data.emoji ?? "lock",
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
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") || "updatedAt";
    const order = searchParams.get("order") || "desc";

    const where: Record<string, unknown> = { userId: user.id };
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Validate sort and order params
    const validSorts = ["name", "updatedAt", "keyCount"];
    const validOrders = ["asc", "desc"];
    const safeSort = validSorts.includes(sort) ? sort : "updatedAt";
    const safeOrder = validOrders.includes(order) ? order : "desc";

    // Build orderBy based on sort param
    let orderBy: Record<string, unknown>;
    if (safeSort === "keyCount") {
      orderBy = { keys: { _count: safeOrder } };
    } else {
      orderBy = { [safeSort]: safeOrder };
    }

    const vaults = await db.vault.findMany({
      where,
      include: {
        _count: {
          select: { keys: true },
        },
      },
      orderBy,
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
