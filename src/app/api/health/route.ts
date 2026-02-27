import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/health — Health check endpoint
// Returns 200 immediately so Railway marks the service as healthy.
// Database status is included but does not block the response.
export async function GET() {
  let dbStatus = "unknown";

  try {
    await db.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch {
    dbStatus = "unavailable";
  }

  return NextResponse.json({
    status: "ok",
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
