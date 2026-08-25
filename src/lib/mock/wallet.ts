import type { WalletSummary } from "@/lib/types";

/**
 * Wallet headline figures. The transaction list belongs to the /wallet page and
 * is not needed for the dashboard.
 */
const WALLET: WalletSummary = {
  balance: 12_480.55,
  pendingEarnings: 3_215.2,
  currency: "USD",
};

export function getWalletSummary(): WalletSummary {
  return WALLET;
}
