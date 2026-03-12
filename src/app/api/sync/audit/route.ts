import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/extension-auth";
import { getCorsHeaders, handleCorsOptions } from "@/lib/cors";

export async function OPTIONS(request: Request) {
  return handleCorsOptions(request);
}

const auditEntrySchema = z.object({
  timestamp: z.string(),
  action: z.string(),
  service: z.string().nullable().optional(),
  keyName: z.string().nullable().optional(),
  vaultName: z.string().nullable().optional(),
  source: z.enum(["extension", "cli", "mcp"]),
});

const syncAuditSchema = z.object({
  entries: z.array(auditEntrySchema).min(1).max(100),
});

export async function POST(request: Request) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = syncAuditSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { entries } = parsed.data;

    await db.auditLog.createMany({
      data: entries.map((entry) => ({
        userId: user.id,
        action: entry.action,
        service: entry.service ?? null,
        keyName: entry.keyName ?? null,
        vaultName: entry.vaultName ?? null,
        source: entry.source,
        createdAt: new Date(entry.timestamp),
      })),
    });

    const corsHeaders = getCorsHeaders(request);
    return NextResponse.json({ received: entries.length }, { headers: corsHeaders });
  } catch (error) {
    console.error("Sync audit error:", error);
    const corsHeaders = getCorsHeaders(request);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
