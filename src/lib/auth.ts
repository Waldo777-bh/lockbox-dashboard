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
    });
  }

  return user;
}

export async function requireUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}
