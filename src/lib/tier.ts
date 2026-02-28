import { db } from "@/lib/db";
import { getTierLimits, type Tier } from "@/lib/stripe";

export interface TierInfo {
  tier: Tier;
  licenceKey: string | null;
  limits: { vaults: number; keys: number };
  usage: { vaults: number; keys: number };
  canCreateVault: boolean;
  canAddKey: boolean;
}

export async function getUserTierInfo(userId: string): Promise<TierInfo> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      licenceKey: true,
      _count: {
        select: { vaults: true },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tier = (user.tier as Tier) || "free";
  const limits = getTierLimits(tier);

  // Count total keys across all vaults
  const keyCount = await db.key.count({
    where: { vault: { userId } },
  });

  const usage = {
    vaults: user._count.vaults,
    keys: keyCount,
  };

  return {
    tier,
    licenceKey: user.licenceKey,
    limits: {
      vaults: limits.vaults === Infinity ? -1 : limits.vaults,
      keys: limits.keys === Infinity ? -1 : limits.keys,
    },
    usage,
    canCreateVault: tier !== "free" || usage.vaults < limits.vaults,
    canAddKey: tier !== "free" || usage.keys < limits.keys,
  };
}

export async function checkVaultLimit(userId: string): Promise<{
  allowed: boolean;
  message?: string;
}> {
  const info = await getUserTierInfo(userId);
  if (info.canCreateVault) {
    return { allowed: true };
  }
  return {
    allowed: false,
    message: `Free tier allows ${info.limits.vaults} vault. Upgrade to Pro for unlimited vaults.`,
  };
}

export async function checkKeyLimit(userId: string): Promise<{
  allowed: boolean;
  message?: string;
}> {
  const info = await getUserTierInfo(userId);
  if (info.canAddKey) {
    return { allowed: true };
  }
  return {
    allowed: false,
    message: `Free tier allows ${info.limits.keys} keys. You have ${info.usage.keys}/${info.limits.keys}. Upgrade to Pro for unlimited keys.`,
  };
}
