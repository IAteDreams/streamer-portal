import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wallet | Streamer Portal",
};

export default function WalletPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Wallet</h1>
      <p className="text-sm text-muted-foreground">
        Balance, pending earnings, and transactions will appear here.
      </p>
    </div>
  );
}
