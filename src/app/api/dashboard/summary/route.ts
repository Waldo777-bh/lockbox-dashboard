import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const [vaultMetadata, vaultSync, recentAudit, extensionTokenCount] =
      await Promise.all([
        db.vaultMetadata.findUnique({
          where: { userId: user.id },
        }),
        db.vaultSync.findUnique({
          where: { userId: user.id },
          select: { version: true, syncedAt: true },
        }),
        db.auditLog.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        db.extensionToken.count({
          where: {
            userId: user.id,
            expiresAt: { gt: new Date() },
          },
        }),
      ]);

    const isSynced = !!vaultSync;
    const hasExtensionToken = extensionTokenCount > 0;

    return NextResponse.json({
      sync: {
        isSynced,
        lastSyncedAt: vaultSync?.syncedAt?.toISOString() ?? null,
        version: vaultSync?.version ?? 0,
        hasExtensionToken,
      },
      metadata: vaultMetadata
        ? {
            vaultCount: vaultMetadata.vaultCount,
            totalKeys: vaultMetadata.totalKeys,
            vaults: JSON.parse(vaultMetadata.vaultsJson),
            services: JSON.parse(vaultMetadata.servicesJson),
            lastModified: vaultMetadata.lastModified.toISOString(),
          }
        : null,
      recentActivity: recentAudit.map((log) => ({
        id: log.id,
        action: log.action,
        service: log.service,
        keyName: log.keyName,
        vaultName: log.vaultName,
        source: log.source,
        createdAt: log.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
