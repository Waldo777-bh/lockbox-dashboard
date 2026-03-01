import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

export const TIER_LIMITS = {
  free: { vaults: 1, keys: 25 },
  pro: { vaults: Infinity, keys: Infinity },
  team: { vaults: Infinity, keys: Infinity },
} as const;

export type Tier = "free" | "pro" | "team";

export function getTierLimits(tier: Tier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

export function generateLicenceKey(): string {
  const chars = "0123456789abcdef";
  let key = "lbox_pro_";
  for (let i = 0; i < 24; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}
