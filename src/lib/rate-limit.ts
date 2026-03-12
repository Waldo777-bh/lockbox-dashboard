interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS = 30;

// NOTE: This in-memory rate limiter only works within a single process.
// In serverless deployments (Vercel/Railway), each invocation may get a
// fresh process. For production, consider Upstash Redis or Vercel KV.

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}

export function checkRateLimit(userId: string): {
  success: boolean;
  remaining: number;
  resetAt: Date;
} {
  // Inline cleanup instead of setInterval (avoids timer leak in serverless)
  cleanupExpired();

  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    // New window
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: new Date(now + WINDOW_MS),
    };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(entry.windowStart + WINDOW_MS),
    };
  }

  entry.count++;
  return {
    success: true,
    remaining: MAX_REQUESTS - entry.count,
    resetAt: new Date(entry.windowStart + WINDOW_MS),
  };
}
