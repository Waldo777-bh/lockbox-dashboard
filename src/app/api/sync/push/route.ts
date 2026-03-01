import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/extension-auth";

const syncPushSchema = z.object({
  encryptedVault: z.string().min(1).max(5 * 1024 * 1024), // 5MB max
  metadata: z.object({
    vaultCount: z.number().int().min(0),
    totalKeys: z.number().int().min(0),
    vaults: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        keyCount: z.number().int(),
        services: z.array(z.string()),
        lastModified: z.string(),
      })
    ),
    services: z.array(
      z.object({
        name: z.string(),
        keyCount: z.number().int(),
        keyNames: z.array(z.string()),
      })
    ),
    lastModified: z.string(),
  }),
  checksum: z.string().min(1),
});

// In-memory rate limit for sync pushes (60/hour)
const pushRateMap = new Map<string, { count: number; windowStart: number }>();
const PUSH_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PUSHES = 60;

function checkPushRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = pushRateMap.get(userId);
  if (!entry || now - entry.windowStart > PUSH_WINDOW_MS) {
    pushRateMap.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_PUSHES) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!checkPushRateLimit(user.id)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 60 syncs per hour." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = syncPushSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { encryptedVault, metadata, checksum } = parsed.data;

    // Upsert the encrypted vault blob
    const vaultSync = await db.vaultSync.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        encryptedVault,
        checksum,
        version: 1,
      },
      update: {
        encryptedVault,
        checksum,
        version: { increment: 1 },
        syncedAt: new Date(),
      },
    });

    // Upsert the metadata (for dashboard display)
    await db.vaultMetadata.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        vaultCount: metadata.vaultCount,
        totalKeys: metadata.totalKeys,
        vaultsJson: JSON.stringify(metadata.vaults),
        servicesJson: JSON.stringify(metadata.services),
        lastModified: new Date(metadata.lastModified),
      },
      update: {
        vaultCount: metadata.vaultCount,
        totalKeys: metadata.totalKeys,
        vaultsJson: JSON.stringify(metadata.vaults),
        servicesJson: JSON.stringify(metadata.services),
        lastModified: new Date(metadata.lastModified),
      },
    });

    return NextResponse.json({
      success: true,
      syncedAt: vaultSync.syncedAt.toISOString(),
      version: vaultSync.version,
    });
  } catch (error) {
    console.error("Sync push error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
