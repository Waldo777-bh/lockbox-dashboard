import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { billing } = body;

    if (!billing || !["monthly", "annual"].includes(billing)) {
      return NextResponse.json(
        { error: "billing must be 'monthly' or 'annual'" },
        { status: 400 },
      );
    }

    const priceId =
      billing === "monthly"
        ? process.env.STRIPE_PRO_MONTHLY_PRICE_ID
        : process.env.STRIPE_PRO_ANNUAL_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price not configured" },
        { status: 500 },
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = (
      await db.user.findUnique({
        where: { id: user.id },
        select: { stripeCustomerId: true },
      })
    )?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { lockboxUserId: user.id, clerkId: user.clerkId },
      });
      stripeCustomerId = customer.id;
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/dashboard/settings?upgraded=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard/pricing`,
      metadata: { lockboxUserId: user.id },
      subscription_data: {
        metadata: { lockboxUserId: user.id },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
