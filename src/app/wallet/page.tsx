import type { Metadata } from "next";

import { WalletPanel } from "@/components/wallet-panel";
import { getTransactions, getWalletSummary } from "@/lib/payouts/service";

export const metadata: Metadata = {
  title: "Wallet | Streamer Portal",
};

// Reads live ledger state, so it must never be prerendered.
export const dynamic = "force-dynamic";

export default async function WalletPage() {
  // Balance and history come from the same derived source in one place, so
  // they cannot show inconsistent state.
  const [summary, transactions] = await Promise.all([
    getWalletSummary(),
    getTransactions(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Your balance, pending earnings, and every transaction to date.
        </p>
      </header>

      <WalletPanel summary={summary} transactions={transactions} />
    </div>
  );
}
