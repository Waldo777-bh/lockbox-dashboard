import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { valid: false, error: "Missing Bearer token" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);

    const extensionToken = await db.extensionToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!extensionToken) {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    if (extensionToken.expiresAt < new Date()) {
      await db.extensionToken.delete({ where: { id: extensionToken.id } });
      return NextResponse.json(
        { valid: false, error: "Token expired" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      userId: extensionToken.user.id,
      tier: extensionToken.user.tier,
      email: extensionToken.user.email,
    });
  } catch (error) {
    console.error("Extension verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
