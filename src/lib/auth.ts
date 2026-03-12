import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Try to find existing user
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      clerkId: true,
      email: true,
      onboardingCompleted: true,
      onboardingStep: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Fallback: create user if webhook didn't fire
  if (!user) {
    const clerkUser = await currentUser();
    user = await db.user.create({
      data: {
        clerkId: userId,
        email:
          clerkUser?.emailAddresses[0]?.emailAddress ?? "unknown@example.com",
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        onboardingCompleted: true,
        onboardingStep: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return user;
}

export async function requireUser() {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return null;
    }
    throw error;
  }
}
