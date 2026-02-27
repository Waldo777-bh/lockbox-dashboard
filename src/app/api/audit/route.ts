import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

// GET /api/audit — Get audit logs for current user
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(req.url);

    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const since = searchParams.get("since");
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "50"),
      200
    );
    const offset = parseInt(searchParams.get("offset") ?? "0");

    // Build where clause
    const where: Record<string, unknown> = { userId: user.id };
    if (action) where.action = action;
    if (since) where.createdAt = { gte: new Date(since) };
    if (search) {
      where.OR = [
        { action: { contains: search, mode: "insensitive" } },
        { service: { contains: search, mode: "insensitive" } },
        { keyName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to fetch audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
