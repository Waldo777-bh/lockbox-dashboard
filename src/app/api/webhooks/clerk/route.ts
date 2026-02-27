import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    primary_email_address_id?: string;
  };
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  // Handle events
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses?.[0]?.email_address ?? "unknown@example.com";

    await db.user.create({
      data: {
        clerkId: id,
        email,
      },
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (email) {
      await db.user.updateMany({
        where: { clerkId: id },
        data: { email },
      });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    // Cascade delete handles vaults, keys, audit logs, and API keys
    await db.user.deleteMany({
      where: { clerkId: id },
    });
  }

  return NextResponse.json({ success: true });
}
