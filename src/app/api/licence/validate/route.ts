import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Simple in-memory rate limiter for licence validation
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { error: "Licence key is required" },
      { status: 400 },
    );
  }

  // Rate limit by key (10 req/min)
  const now = Date.now();
  const rateKey = key.slice(0, 12); // Use prefix for rate limiting
  const entry = rateLimitMap.get(rateKey);

  if (entry) {
    if (now < entry.resetAt) {
      if (entry.count >= 10) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Try again later." },
          { status: 429 },
        );
      }
      entry.count++;
    } else {
      rateLimitMap.set(rateKey, { count: 1, resetAt: now + 60000 });
    }
  } else {
    rateLimitMap.set(rateKey, { count: 1, resetAt: now + 60000 });
  }

  try {
    const user = await db.user.findUnique({
      where: { licenceKey: key },
      select: {
        tier: true,
        email: true,
        subscriptionEnd: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        valid: false,
        tier: "free",
        email: null,
      });
    }

    // Check if subscription is still active
    const isActive =
      user.tier === "pro" &&
      (!user.subscriptionEnd || user.subscriptionEnd > new Date());

    return NextResponse.json({
      valid: isActive,
      tier: isActive ? user.tier : "free",
      email: user.email,
    });
  } catch (error) {
    console.error("Licence validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate licence" },
      { status: 500 },
    );
  }
}
