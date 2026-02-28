import { NextRequest, NextResponse } from "next/server";
import { stripe, generateLicenceKey } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.lockboxUserId;

        if (!userId) {
          console.error("No lockboxUserId in checkout session metadata");
          break;
        }

        // Generate licence key
        const licenceKey = generateLicenceKey();

        await db.user.update({
          where: { id: userId },
          data: {
            tier: "pro",
            licenceKey,
            subscriptionId:
              typeof session.subscription === "string"
                ? session.subscription
                : session.subscription?.id ?? null,
          },
        });

        // Create audit log
        await db.auditLog.create({
          data: {
            action: "TIER_UPGRADED",
            userId,
            metadata: { tier: "pro", source: "stripe" },
          },
        });

        console.log(`User ${userId} upgraded to Pro. Licence: ${licenceKey}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.lockboxUserId;

        if (!userId) break;

        const isActive = ["active", "trialing"].includes(subscription.status);

        // In newer Stripe API versions, current_period_end is on subscription items
        const periodEnd =
          subscription.items?.data?.[0]?.current_period_end ?? null;

        await db.user.update({
          where: { id: userId },
          data: {
            tier: isActive ? "pro" : "free",
            subscriptionEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.lockboxUserId;

        if (!userId) break;

        await db.user.update({
          where: { id: userId },
          data: {
            tier: "free",
            subscriptionId: null,
            subscriptionEnd: null,
          },
        });

        await db.auditLog.create({
          data: {
            action: "TIER_DOWNGRADED",
            userId,
            metadata: { tier: "free", reason: "subscription_cancelled" },
          },
        });

        console.log(`User ${userId} downgraded to Free.`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (customerId) {
          const user = await db.user.findUnique({
            where: { stripeCustomerId: customerId },
          });
          if (user) {
            await db.auditLog.create({
              data: {
                action: "PAYMENT_FAILED",
                userId: user.id,
                metadata: { invoiceId: invoice.id },
              },
            });
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
