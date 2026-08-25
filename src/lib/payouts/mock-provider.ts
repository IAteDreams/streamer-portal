import type {
  CreatePayoutInput,
  CreatePayoutResult,
  PayoutProvider,
} from "@/lib/payouts/provider";

/**
 * Default when STRIPE_SECRET_KEY is absent, so the app runs with no payment
 * account at all. Moves no money; returns a synthetic reference and reports the
 * payout as pending, exactly as a real provider would before settlement.
 */
export const mockPayoutProvider: PayoutProvider = {
  name: "mock",

  async createPayout(input: CreatePayoutInput): Promise<CreatePayoutResult> {
    return {
      providerRef: `mock_${input.idempotencyKey.slice(0, 12)}`,
      status: "pending",
    };
  },
};
