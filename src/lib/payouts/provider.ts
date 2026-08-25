export interface CreatePayoutInput {
  amountCents: number;
  currency: string;
  /**
   * Passed straight through to the provider. Every provider worth using
   * accepts one, so a retried network call cannot create a second transfer.
   */
  idempotencyKey: string;
  description: string;
}

export type ProviderPayoutStatus = "pending" | "paid" | "failed";

export interface CreatePayoutResult {
  providerRef: string;
  status: ProviderPayoutStatus;
}

/**
 * The seam between the ledger and whoever actually moves the money. Swapping
 * vendors means writing one adapter; the domain does not change.
 */
export interface PayoutProvider {
  readonly name: string;
  createPayout(input: CreatePayoutInput): Promise<CreatePayoutResult>;
}
