import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { format } from "date-fns";

// GET /api/audit/export — Export audit logs as CSV
export async function GET() {
  try {
    const user = await getCurrentUser();

    const logs = await db.auditLog.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Build CSV
    const headers = ["Timestamp", "Action", "Service", "Key Name", "Details"];
    const rows = logs.map((log) => {
      const timestamp = format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss");
      const action = log.action;
      const service = log.service ?? "";
      const keyName = log.keyName ?? "";
      const details =
        log.metadata &&
        typeof log.metadata === "object" &&
        log.metadata !== null &&
        "vaultName" in log.metadata
          ? String((log.metadata as Record<string, unknown>).vaultName)
          : "";

      // Escape CSV fields that contain commas, quotes, or newlines
      const escape = (field: string) => {
        if (
          field.includes(",") ||
          field.includes('"') ||
          field.includes("\n")
        ) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      };

      return [timestamp, action, service, keyName, details]
        .map(escape)
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="lockbox-audit-log.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to export audit logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
