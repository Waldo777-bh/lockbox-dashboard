import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/extension-auth";
import { getCorsHeaders, handleCorsOptions } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vaultSync = await db.vaultSync.findUnique({
      where: { userId: user.id },
      select: { version: true, syncedAt: true, checksum: true },
    });

    if (!vaultSync) {
      return NextResponse.json({
        hasData: false,
        version: 0,
        syncedAt: null,
        checksum: null,
      });
    }

    const corsHeaders = getCorsHeaders(request);
    return NextResponse.json({
      hasData: true,
      version: vaultSync.version,
      syncedAt: vaultSync.syncedAt.toISOString(),
      checksum: vaultSync.checksum,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Sync status error:", error);
    const corsHeaders = getCorsHeaders(request);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
