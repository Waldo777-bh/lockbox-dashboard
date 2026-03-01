import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/extension-auth";

/**
 * POST /api/sync/reset
 *
 * Called by the extension when the user deletes their wallet.
 * Clears all synced data (VaultSync, VaultMetadata, AuditLog) for the user
 * so the dashboard doesn't show stale data from a previous wallet.
 */
export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all synced data for this user
    await db.$transaction([
      db.vaultSync.deleteMany({ where: { userId: user.id } }),
      db.vaultMetadata.deleteMany({ where: { userId: user.id } }),
      db.auditLog.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ success: true, message: "Sync data cleared" });
  } catch (error) {
    console.error("Sync reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
