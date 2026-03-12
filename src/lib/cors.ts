import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "chrome-extension://",  // Any Chrome extension (matched by startsWith)
];

const ALLOWED_DASHBOARD_ORIGIN = "https://dashboard.yourlockbox.dev";

/**
 * Get CORS headers for extension/sync API routes.
 * Allows requests from Chrome extensions and the dashboard itself.
 */
export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";

  // Allow Chrome extensions and the dashboard origin
  const isAllowed =
    origin.startsWith("chrome-extension://") ||
    origin === ALLOWED_DASHBOARD_ORIGIN;

  if (!isAllowed) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

/**
 * Handle CORS preflight (OPTIONS) requests for sync routes.
 */
export function handleCorsOptions(request: Request): NextResponse {
  const headers = getCorsHeaders(request);
  return new NextResponse(null, { status: 204, headers });
}
