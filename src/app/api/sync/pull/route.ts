import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/extension-auth";

export async function GET(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vaultSync = await db.vaultSync.findUnique({
      where: { userId: user.id },
    });

    if (!vaultSync) {
      return NextResponse.json(
        { error: "No sync data found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      encryptedVault: vaultSync.encryptedVault,
      version: vaultSync.version,
      syncedAt: vaultSync.syncedAt.toISOString(),
      checksum: vaultSync.checksum,
    });
  } catch (error) {
    console.error("Sync pull error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
