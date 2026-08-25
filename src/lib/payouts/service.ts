import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { payoutRequests, streamers, transactions } from "@/lib/db/schema";
import { getPayoutProvider } from "@/lib/payouts";
import type { Transaction, WalletSummary } from "@/lib/types";

// ---------------------------------------------------------------------------
// SECURITY: this service has NO AUTHENTICATION.
//
// The streamer is resolved server-side by `getCurrentStreamerId()` and is never
// read from a request body or query string, so a caller cannot pay out from
// someone else's balance. But any caller who can reach POST /api/payouts can
// drain THIS streamer's balance, because there is nothing to prove who they are.
//
// DO NOT DEPLOY PUBLICLY AS-IS. Authentication is out of scope per CLAUDE.md.
// ---------------------------------------------------------------------------

export const MIN_PAYOUT_CENTS = 1;

export type PayoutFailureReason =
  "invalid_amount" | "insufficient_funds" | "idempotency_conflict";

export type PayoutResult =
  | { ok: true; replayed: boolean; payoutId: string; amountCents: number }
  | { ok: false; reason: PayoutFailureReason; message: string };

/** Stands in for a session lookup. Auth is out of scope; see the banner above. */
async function getCurrentStreamerId(): Promise<string> {
  const [row] = await db
    .select({ id: streamers.id })
    .from(streamers)
    .orderBy(streamers.createdAt)
    .limit(1);

  if (!row) {
    throw new Error("No streamer seeded. Run `npm run db:seed`.");
  }

  return row.id;
}

/**
 * Available balance = completed entries PLUS pending debits.
 *
 * Including pending debits is what reserves funds for an in-flight payout. A
 * new payout row is written as pending, so if only completed rows counted, a
 * second concurrent request would still see the full balance and overdraw it -
 * the row lock alone does not prevent that, because the locked reader would
 * read a balance that ignores the payout just committed.
 *
 * Pending CREDITS (unsettled earnings) are deliberately excluded: that money
 * has not arrived and must not be spendable.
 */
const AVAILABLE_CENTS = sql<number>`coalesce(sum(${transactions.amountCents}) filter (where ${transactions.status} = 'completed' or (${transactions.status} = 'pending' and ${transactions.amountCents} < 0)), 0)`;

const PENDING_CENTS = sql<number>`coalesce(sum(${transactions.amountCents}) filter (where ${transactions.status} = 'pending' and ${transactions.type} = 'earning'), 0)`;

const LIFETIME_CENTS = sql<number>`coalesce(sum(${transactions.amountCents}) filter (where ${transactions.status} = 'completed' and ${transactions.amountCents} > 0), 0)`;

/** Single source of truth for the wallet page AND the dashboard tile. */
export async function getWalletSummary(): Promise<WalletSummary> {
  const streamerId = await getCurrentStreamerId();

  const [streamer] = await db
    .select({ currency: streamers.currency })
    .from(streamers)
    .where(eq(streamers.id, streamerId));

  const [balances] = await db
    .select({
      available: AVAILABLE_CENTS.mapWith(Number),
      pending: PENDING_CENTS.mapWith(Number),
      lifetime: LIFETIME_CENTS.mapWith(Number),
    })
    .from(transactions)
    .where(eq(transactions.streamerId, streamerId));

  return {
    balanceCents: balances?.available ?? 0,
    pendingEarningsCents: balances?.pending ?? 0,
    lifetimeEarningsCents: balances?.lifetime ?? 0,
    currency: streamer?.currency ?? "USD",
  };
}

export async function getTransactions(limit = 100): Promise<Transaction[]> {
  const streamerId = await getCurrentStreamerId();

  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.streamerId, streamerId))
    .orderBy(desc(transactions.occurredAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    description: row.description,
    type: row.type,
    status: row.status,
    amountCents: row.amountCents,
    currency: row.currency,
    occurredAt: row.occurredAt.toISOString(),
  }));
}

async function findByIdempotencyKey(key: string) {
  const [row] = await db
    .select({ id: payoutRequests.id, amountCents: payoutRequests.amountCents })
    .from(payoutRequests)
    .where(eq(payoutRequests.idempotencyKey, key))
    .limit(1);

  return row;
}

/**
 * Requests a payout.
 *
 * Correctness rests on two things, both enforced by Postgres rather than by
 * application code that could race:
 *
 *  1. `SELECT ... FOR UPDATE` on the streamer row serialises concurrent payouts,
 *     so two requests cannot both read the same balance and both pass the
 *     sufficient-funds check.
 *  2. The UNIQUE index on `payout_requests.idempotency_key` makes a duplicate
 *     insert impossible even if two identical requests interleave perfectly.
 */
export async function requestPayout(
  amountCents: number,
  idempotencyKey: string,
): Promise<PayoutResult> {
  if (!Number.isInteger(amountCents) || amountCents < MIN_PAYOUT_CENTS) {
    return {
      ok: false,
      reason: "invalid_amount",
      message: "Amount must be a positive whole number of cents.",
    };
  }

  if (!idempotencyKey.trim()) {
    return {
      ok: false,
      reason: "invalid_amount",
      message: "An Idempotency-Key header is required.",
    };
  }

  const streamerId = await getCurrentStreamerId();

  // Fast path for a replay: same key, same amount, return the original outcome.
  // The unique index below is what actually guarantees no duplicate; this only
  // avoids doing the work twice.
  const existing = await findByIdempotencyKey(idempotencyKey);
  if (existing) {
    if (existing.amountCents !== amountCents) {
      return {
        ok: false,
        reason: "idempotency_conflict",
        message:
          "This Idempotency-Key was already used with a different amount.",
      };
    }
    return {
      ok: true,
      replayed: true,
      payoutId: existing.id,
      amountCents: existing.amountCents,
    };
  }

  let outcome;
  try {
    outcome = await db.transaction(async (tx) => {
      // Serialise payouts for this streamer.
      const [locked] = await tx
        .select({ id: streamers.id, currency: streamers.currency })
        .from(streamers)
        .where(eq(streamers.id, streamerId))
        .for("update");

      if (!locked) {
        throw new Error("Streamer disappeared mid-transaction.");
      }

      const [balanceRow] = await tx
        .select({ available: AVAILABLE_CENTS.mapWith(Number) })
        .from(transactions)
        .where(eq(transactions.streamerId, streamerId));

      const available = balanceRow?.available ?? 0;

      // The authoritative check. Client-side validation is UX only.
      if (amountCents > available) {
        return {
          ok: false as const,
          reason: "insufficient_funds" as const,
          message: "Amount exceeds the available balance.",
        };
      }

      const description = "Payout to linked bank account";

      const [ledgerRow] = await tx
        .insert(transactions)
        .values({
          streamerId,
          type: "payout",
          status: "pending",
          amountCents: -amountCents,
          currency: locked.currency,
          description,
        })
        .returning({ id: transactions.id });

      const [request] = await tx
        .insert(payoutRequests)
        .values({
          streamerId,
          idempotencyKey,
          amountCents,
          currency: locked.currency,
          status: "pending",
          transactionId: ledgerRow.id,
        })
        .returning({ id: payoutRequests.id });

      return {
        ok: true as const,
        payoutId: request.id,
        transactionId: ledgerRow.id,
        currency: locked.currency,
        description,
      };
    });
  } catch (error) {
    // Two identical requests can interleave past the fast path above; the
    // unique index rejects the loser. That is a replay, not an error.
    if (isUniqueViolation(error)) {
      const replay = await findByIdempotencyKey(idempotencyKey);
      if (replay) {
        return {
          ok: true,
          replayed: true,
          payoutId: replay.id,
          amountCents: replay.amountCents,
        };
      }
    }
    throw error;
  }

  if (!outcome.ok) {
    return { ok: false, reason: outcome.reason, message: outcome.message };
  }

  // The provider call happens after commit: the ledger entry must exist before
  // the money is asked to move, so a crash here leaves a recoverable pending
  // row rather than an untracked transfer.
  try {
    const provider = getPayoutProvider();
    const result = await provider.createPayout({
      amountCents,
      currency: outcome.currency,
      idempotencyKey,
      description: outcome.description,
    });

    await db
      .update(payoutRequests)
      .set({ providerRef: result.providerRef, status: result.status })
      .where(eq(payoutRequests.id, outcome.payoutId));

    await db
      .update(transactions)
      .set({
        providerRef: result.providerRef,
        status: result.status === "paid" ? "completed" : "pending",
      })
      .where(eq(transactions.id, outcome.transactionId));
  } catch {
    // Leave both rows pending. Retrying with the same key replays rather than
    // creating a second payout, and the provider received the same idempotency
    // key, so the transfer is not duplicated on their side either.
  }

  return {
    ok: true,
    replayed: false,
    payoutId: outcome.payoutId,
    amountCents,
  };
}

/**
 * Postgres unique-violation SQLSTATE.
 *
 * Drizzle wraps driver errors in its own Error and hangs the original off
 * "cause", so the code is not on the object it hands you - walk the chain.
 * Checking only the top-level object silently misses every real violation.
 */
function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;

  for (let depth = 0; current && depth < 5; depth++) {
    if (
      typeof current === "object" &&
      "code" in current &&
      (current as { code?: string }).code === "23505"
    ) {
      return true;
    }
    current =
      typeof current === "object" && "cause" in current
        ? (current as { cause?: unknown }).cause
        : undefined;
  }

  return false;
}

/** Used by the Stripe webhook to move a payout to its final state. */
export async function settlePayoutByProviderRef(
  providerRef: string,
  status: "paid" | "failed",
): Promise<boolean> {
  const [request] = await db
    .select({
      id: payoutRequests.id,
      transactionId: payoutRequests.transactionId,
    })
    .from(payoutRequests)
    .where(
      and(
        eq(payoutRequests.providerRef, providerRef),
        eq(payoutRequests.status, "pending"),
      ),
    )
    .limit(1);

  if (!request) return false;

  await db
    .update(payoutRequests)
    .set({ status })
    .where(eq(payoutRequests.id, request.id));

  if (request.transactionId) {
    await db
      .update(transactions)
      .set({ status: status === "paid" ? "completed" : "failed" })
      .where(eq(transactions.id, request.transactionId));
  }

  return true;
}
