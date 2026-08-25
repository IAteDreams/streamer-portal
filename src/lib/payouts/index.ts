import { mockPayoutProvider } from "@/lib/payouts/mock-provider";
import type { PayoutProvider } from "@/lib/payouts/provider";
import { createStripePayoutProvider } from "@/lib/payouts/stripe-provider";

/**
 * Stripe is used only when fully configured; otherwise the mock provider keeps
 * the app runnable with no payment account. Never throws for missing Stripe
 * config - that would make the wallet unusable in local development.
 */
export function getPayoutProvider(): PayoutProvider {
  const apiKey = process.env.STRIPE_API_KEY ?? process.env.STRIPE_SECRET_KEY;
  const account = process.env.STRIPE_CONNECT_ACCOUNT_ID;

  if (apiKey && account) {
    return createStripePayoutProvider(apiKey, account);
  }

  return mockPayoutProvider;
}
