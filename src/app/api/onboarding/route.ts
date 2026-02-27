import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/onboarding — Get onboarding state
export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      completed: user.onboardingCompleted,
      step: user.onboardingStep,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to get onboarding state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/onboarding — Update onboarding state
export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const data: { onboardingStep?: number; onboardingCompleted?: boolean } = {};

    if (typeof body.step === "number") {
      data.onboardingStep = body.step;
    }

    if (typeof body.completed === "boolean") {
      data.onboardingCompleted = body.completed;
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({
      completed: updated.onboardingCompleted,
      step: updated.onboardingStep,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to update onboarding state:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
