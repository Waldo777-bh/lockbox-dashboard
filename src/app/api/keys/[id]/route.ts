import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog, AuditAction } from "@/lib/audit";

// DELETE /api/keys/[id] — Revoke an API key
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const apiKey = await db.apiKey.findFirst({
      where: { id, userId: user.id },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    await db.apiKey.delete({ where: { id } });

    await createAuditLog({
      action: AuditAction.API_KEY_REVOKED,
      userId: user.id,
      metadata: { keyName: apiKey.name, prefix: apiKey.prefix },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to revoke API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
