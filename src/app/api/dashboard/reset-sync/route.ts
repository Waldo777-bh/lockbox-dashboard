import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/dashboard/reset-sync
 *
 * Dashboard-side endpoint to clear all synced data (VaultSync, VaultMetadata,
 * AuditLog) for the current user. Used when the extension wallet was deleted
 * but stale data remains on the dashboard.
 */
export async function POST() {
  try {
    const user = await getCurrentUser();

    await db.$transaction([
      db.vaultSync.deleteMany({ where: { userId: user.id } }),
      db.vaultMetadata.deleteMany({ where: { userId: user.id } }),
      db.auditLog.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ success: true, message: "Sync data cleared" });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Reset sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
