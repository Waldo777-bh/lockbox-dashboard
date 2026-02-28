import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

// GET /api/user — Return current user info including tier
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        email: true,
        tier: true,
      },
    });

    if (!user) {
      // Auto-create user if webhook didn't fire
      const clerkUser = await currentUser();
      user = await db.user.create({
        data: {
          clerkId: userId,
          email:
            clerkUser?.emailAddresses[0]?.emailAddress ?? "unknown@example.com",
        },
        select: {
          id: true,
          email: true,
          tier: true,
        },
      });
    }

    // Get Clerk user for name/image
    const clerkUser = await currentUser();

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: clerkUser
        ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
          null
        : null,
      imageUrl: clerkUser?.imageUrl ?? null,
      tier: user.tier,
    });
  } catch (error) {
    console.error("Failed to get user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
