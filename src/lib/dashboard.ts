import { getConnectedAccounts } from "@/lib/mock/accounts";
import { getWalletSummary } from "@/lib/payouts/service";
import type { DashboardMetrics } from "@/lib/types";

/** Hardcoded trends. Real numbers would come from a prior-period snapshot. */
const DELTAS = {
  followers: 12.4,
  views: 8.1,
  balance: -3.2,
};

/**
 * Headline numbers for the metric tiles. The balance comes from the same
 * derived wallet summary the /wallet page uses, so the tile and the wallet can
 * never disagree.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const accounts = getConnectedAccounts();
  const wallet = await getWalletSummary();

  return {
    totalFollowers: accounts.reduce((sum, a) => sum + a.followers, 0),
    totalViews: accounts.reduce((sum, a) => sum + a.views, 0),
    balanceCents: wallet.balanceCents,
    currency: wallet.currency,
    followersDelta: DELTAS.followers,
    viewsDelta: DELTAS.views,
    balanceDelta: DELTAS.balance,
  };
}
