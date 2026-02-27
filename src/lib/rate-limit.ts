interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 1000; // 60 seconds
const MAX_REQUESTS = 30;

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

export function checkRateLimit(userId: string): {
  success: boolean;
  remaining: number;
  resetAt: Date;
} {
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
