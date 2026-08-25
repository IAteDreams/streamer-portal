import Stripe from "stripe";

import type {
  CreatePayoutInput,
  CreatePayoutResult,
  PayoutProvider,
} from "@/lib/payouts/provider";

/**
 * Stripe Connect payouts for a streamer portal.
 *
 * Account model: the connected account must be created with **Accounts v2**
 * (`POST /v2/core/accounts`) using `configuration.recipient` requesting the
 * `stripe_balance.stripe_transfers` capability, with `dashboard: "express"`.
 * The old `accounts.create({ type: "express" })` form is a deprecated v1
 * pattern - "express" is now the dashboard dimension, not an account type.
 * This portal only pays money out, so do NOT request `configuration.merchant`
 * or `card_payments`; that only lengthens onboarding.
 *
 * Charge pattern: separate charges and transfers. The platform holds the
 * balance and decides when to release it, which is exactly what a wallet is.
 * Platform fees are taken by transferring less than was earned - never with
 * `application_fee_amount`, which does not apply to this pattern.
 *
 * `idempotencyKey` is handed to Stripe directly. Stripe stores the first
 * response for 24h and replays it, so a retry after a timeout cannot create a
 * second transfer. It is the same key stored in `payout_requests`, which makes
 * the guarantee hold end to end rather than only on our side.
 *
 * The SDK pins the current API version (2026-07-29.dahlia), so no override.
 */
export function createStripePayoutProvider(
  apiKey: string,
  connectedAccountId: string,
): PayoutProvider {
  const stripe = new Stripe(apiKey);

  return {
    name: "stripe",

    async createPayout(input: CreatePayoutInput): Promise<CreatePayoutResult> {
      await assertCanReceiveTransfers(stripe, connectedAccountId);

      const transfer = await stripe.transfers.create(
        {
          amount: input.amountCents,
          currency: input.currency.toLowerCase(),
          destination: connectedAccountId,
          description: input.description,
        },
        { idempotencyKey: input.idempotencyKey },
      );

      // A transfer only moves funds from the platform balance to the connected
      // account. Settlement to their bank arrives later as a payout.* webhook,
      // which is the source of truth for the final status.
      return { providerRef: transfer.id, status: "pending" };
    },
  };
}

/**
 * Go-live readiness check. The v1 fields `payouts_enabled` / `charges_enabled`
 * are deprecated; for a recipient account the authoritative signal is the v2
 * capability status. Transferring to an account that has not finished
 * onboarding fails, so check before moving money rather than after.
 */
async function assertCanReceiveTransfers(
  stripe: Stripe,
  accountId: string,
): Promise<void> {
  const account = await stripe.v2.core.accounts.retrieve(accountId, {
    include: ["configuration.recipient"],
  });

  const status =
    account.configuration?.recipient?.capabilities?.stripe_balance
      ?.stripe_transfers?.status;

  if (status !== "active") {
    throw new Error(
      `Connected account ${accountId} cannot receive transfers ` +
        `(stripe_balance.stripe_transfers status: ${status ?? "unknown"}). ` +
        "Finish Connect onboarding before requesting a payout.",
    );
  }
}
