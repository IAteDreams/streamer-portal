import { NextResponse } from "next/server";
import Stripe from "stripe";

import { settlePayoutByProviderRef } from "@/lib/payouts/service";

export const dynamic = "force-dynamic";

/**
 * Stripe sends payout lifecycle events here. The signature is verified against
 * the RAW body - parsing it first would change the bytes and fail verification.
 */
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const raw = await request.text();
  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const settled = await handleEvent(event);
  return NextResponse.json({ received: true, settled });
}

async function handleEvent(event: Stripe.Event): Promise<boolean> {
  switch (event.type) {
    case "transfer.created":
      return false;

    case "payout.paid": {
      const payout = event.data.object as Stripe.Payout;
      return settlePayoutByProviderRef(payout.id, "paid");
    }

    case "payout.failed": {
      const payout = event.data.object as Stripe.Payout;
      return settlePayoutByProviderRef(payout.id, "failed");
    }

    default:
      return false;
  }
}
