import { NextResponse } from "next/server";

import { requestPayout } from "@/lib/payouts/service";

export const dynamic = "force-dynamic";

const STATUS_BY_REASON = {
  invalid_amount: 400,
  insufficient_funds: 400,
  idempotency_conflict: 409,
} as const;

/**
 * POST /api/payouts
 * Header: Idempotency-Key: <uuid>
 * Body:   { "amountCents": 50000 }
 *
 * NOTE: unauthenticated. See the banner in src/lib/payouts/service.ts.
 */
export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key") ?? "";

  if (!idempotencyKey.trim()) {
    return NextResponse.json(
      { error: "Missing Idempotency-Key header." },
      { status: 400 },
    );
  }

  let amountCents: unknown;
  try {
    const body: unknown = await request.json();
    amountCents =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).amountCents
        : undefined;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof amountCents !== "number") {
    return NextResponse.json(
      { error: "amountCents must be a number of minor units." },
      { status: 400 },
    );
  }

  const result = await requestPayout(amountCents, idempotencyKey);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.message, reason: result.reason },
      { status: STATUS_BY_REASON[result.reason] },
    );
  }

  // A replay returns the original outcome with 200, never a second payout.
  return NextResponse.json(result, { status: result.replayed ? 200 : 201 });
}
