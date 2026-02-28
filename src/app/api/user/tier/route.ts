import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserTierInfo } from "@/lib/tier";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const tierInfo = await getUserTierInfo(user.id);
    return NextResponse.json(tierInfo);
  } catch (error) {
    console.error("Tier info error:", error);
    return NextResponse.json(
      { error: "Failed to get tier info" },
      { status: 500 },
    );
  }
}
