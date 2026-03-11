import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic"; // Never cache — polling relies on fresh data

export async function GET() {
  try {
    const user = await getCurrentUser();

    const [vaultMetadata, vaultSync, recentAudit, extensionTokenCount, userRecord] =
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
        db.user.findUnique({
          where: { id: user.id },
          select: { tier: true, licenceKey: true },
        }),
      ]);

    const isSynced = !!vaultSync;
    const hasExtensionToken = extensionTokenCount > 0;

    // Use VaultMetadata from extension sync if available and non-empty.
    // Fall back to legacy Vault/Key tables for users who haven't synced yet.
    let metadata = null;

    if (vaultMetadata && (vaultMetadata.vaultCount > 0 || vaultMetadata.totalKeys > 0)) {
      // Extension has synced real data
      metadata = {
        vaultCount: vaultMetadata.vaultCount,
        totalKeys: vaultMetadata.totalKeys,
        vaults: JSON.parse(vaultMetadata.vaultsJson),
        services: JSON.parse(vaultMetadata.servicesJson),
        lastModified: vaultMetadata.lastModified.toISOString(),
      };
    } else {
      // Fall back: read from legacy Vault/Key tables
      const legacyVaults = await db.vault.findMany({
        where: { userId: user.id },
        include: {
          keys: { select: { id: true, service: true, keyName: true, createdAt: true } },
        },
        orderBy: { updatedAt: "desc" },
      });

      if (legacyVaults.length > 0) {
        let totalKeys = 0;
        const serviceMap = new Map<string, { keyCount: number; keyNames: string[] }>();

        const vaults = legacyVaults.map((v) => {
          const vaultServices = new Set<string>();
          for (const key of v.keys) {
            vaultServices.add(key.service);
            const existing = serviceMap.get(key.service);
            if (existing) {
              existing.keyCount++;
              existing.keyNames.push(key.keyName);
            } else {
              serviceMap.set(key.service, { keyCount: 1, keyNames: [key.keyName] });
            }
          }
          totalKeys += v.keys.length;
          return {
            id: v.id,
            name: v.name,
            keyCount: v.keys.length,
            services: Array.from(vaultServices),
            lastModified: v.updatedAt.toISOString(),
          };
        });

        const services = Array.from(serviceMap.entries()).map(([name, data]) => ({
          name,
          keyCount: data.keyCount,
          keyNames: data.keyNames,
        }));

        metadata = {
          vaultCount: legacyVaults.length,
          totalKeys,
          vaults,
          services,
          lastModified: legacyVaults[0]?.updatedAt.toISOString() ?? new Date().toISOString(),
        };
      }
    }

    return NextResponse.json({
      tier: userRecord?.tier ?? "free",
      sync: {
        isSynced,
        lastSyncedAt: vaultSync?.syncedAt?.toISOString() ?? null,
        version: vaultSync?.version ?? 0,
        hasExtensionToken,
      },
      metadata,
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
