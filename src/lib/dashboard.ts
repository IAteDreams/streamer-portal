import { getConnectedAccounts } from "@/lib/mock/accounts";
import { getWalletSummary } from "@/lib/mock/wallet";
import type { DashboardMetrics } from "@/lib/types";

/** Hardcoded trends. Real numbers would come from a prior-period snapshot. */
const DELTAS = {
  followers: 12.4,
  views: 8.1,
  balance: -3.2,
};

/**
 * Headline numbers for the metric tiles, summed from the same accounts the
 * grid below them renders - so the tiles and the cards can never disagree.
 */
export function getDashboardMetrics(): DashboardMetrics {
  const accounts = getConnectedAccounts();
  const wallet = getWalletSummary();

  return {
    totalFollowers: accounts.reduce((sum, a) => sum + a.followers, 0),
    totalViews: accounts.reduce((sum, a) => sum + a.views, 0),
    balance: wallet.balance,
    currency: wallet.currency,
    followersDelta: DELTAS.followers,
    viewsDelta: DELTAS.views,
    balanceDelta: DELTAS.balance,
  };
}
