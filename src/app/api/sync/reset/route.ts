import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/extension-auth";
import { getCorsHeaders, handleCorsOptions } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

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

    const corsHeaders = getCorsHeaders(request);
    return NextResponse.json({ success: true, message: "Sync data cleared" }, { headers: corsHeaders });
  } catch (error) {
    console.error("Sync reset error:", error);
    const corsHeaders = getCorsHeaders(request);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
