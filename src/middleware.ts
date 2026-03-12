import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk",
  "/api/stripe/webhook",
  "/api/licence/validate",
  "/api/health",
]);

// API routes that accept both Clerk sessions and API key Bearer tokens
const isApiKeyRoute = createRouteMatcher([
  "/api/vaults(.*)",
  "/api/audit(.*)",
]);

// API routes that accept extension Bearer tokens
const isExtensionRoute = createRouteMatcher([
  "/api/sync(.*)",
  "/api/auth/extension-verify",
]);

export default clerkMiddleware(async (auth, request) => {
  // Skip auth for public routes
  if (isPublicRoute(request)) return;

  // For API routes that support API keys, check for Bearer token
  // If present, let the route handler validate it (don't enforce Clerk)
  if (isApiKeyRoute(request)) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer lb_live_")) {
      // API key auth — skip Clerk middleware, let route handler validate
      return;
    }
  }

  // Extension routes accept Bearer tokens — let route handler validate
  // Also pass through CORS preflight (OPTIONS) so the browser can check headers
  if (isExtensionRoute(request)) {
    if (request.method === "OPTIONS") return;
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return;
    }
  }

  // All other routes require Clerk authentication
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
