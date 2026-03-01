import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

/**
 * Authenticate a request from either:
 * 1. Clerk session (dashboard user)
 * 2. Bearer token from ExtensionToken table (extension)
 */
export async function authenticateRequest(request: Request) {
  // Try Bearer token first (extension auth)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && !authHeader.startsWith("Bearer lb_live_")) {
    const token = authHeader.slice(7);
    const extensionToken = await db.extensionToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!extensionToken) {
      return null;
    }

    if (extensionToken.expiresAt < new Date()) {
      // Clean up expired token
      await db.extensionToken.delete({ where: { id: extensionToken.id } });
      return null;
    }

    return {
      id: extensionToken.user.id,
      clerkId: extensionToken.user.clerkId,
      email: extensionToken.user.email,
      tier: extensionToken.user.tier,
    };
  }

  // Fall back to Clerk session
  try {
    const { userId } = await auth();
    if (!userId) return null;

    let user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, clerkId: true, email: true, tier: true },
    });

    if (!user) {
      const clerkUser = await currentUser();
      user = await db.user.create({
        data: {
          clerkId: userId,
          email: clerkUser?.emailAddresses[0]?.emailAddress ?? "unknown@example.com",
        },
        select: { id: true, clerkId: true, email: true, tier: true },
      });
    }

    return user;
  } catch {
    return null;
  }
}
