import { randomBytes, createHash } from "node:crypto";
import { db } from "./db";

export function generateApiKey(): {
  rawKey: string;
  hashedKey: string;
  prefix: string;
} {
  const bytes = randomBytes(32);
  const rawKey = `lb_live_${bytes.toString("base64url")}`;
  const hashedKey = hashApiKey(rawKey);
  const prefix = rawKey.substring(0, 16);

  return { rawKey, hashedKey, prefix };
}

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export async function validateApiKey(rawKey: string) {
  const hashedKey = hashApiKey(rawKey);

  const apiKey = await db.apiKey.findUnique({
    where: { hashedKey },
    include: { user: true },
  });

  if (!apiKey) return null;

  // Check expiry
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update last used
  await db.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsed: new Date() },
  });

  return apiKey.user;
}
