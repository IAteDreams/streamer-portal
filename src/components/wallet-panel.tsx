"use client";

import { useState } from "react";
import { Banknote, Clock, TrendingUp } from "lucide-react";

import { TransactionHistory } from "@/components/transaction-history";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import type { Transaction, WalletSummary } from "@/lib/types";

/** Rounds to whole cents so repeated withdrawals cannot drift on float error. */
function toCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function WalletPanel({
  summary,
  transactions: initialTransactions,
}: {
  summary: WalletSummary;
  transactions: Transaction[];
}) {
  const [balance, setBalance] = useState(summary.balance);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [paidOut, setPaidOut] = useState(false);

  const canWithdraw = balance > 0;

  // Held as a string so partial input stays editable; the parsed value drives
  // validation.
  const parsed = Number.parseFloat(amountInput);
  const amount = Number.isFinite(parsed) ? toCents(parsed) : Number.NaN;

  const error = getAmountError(amountInput, amount, balance, summary.currency);

  // Reset in the open handler rather than an effect - see
  // react-hooks/set-state-in-effect.
  function openDialog() {
    setAmountInput(balance.toFixed(2));
    setConfirmOpen(true);
  }

  function confirmPayout() {
    if (error) return;

    // Mock only: there is no payment integration. This mutates React state, so
    // it resets on reload - the note under the balance says so.
    const payout: Transaction = {
      id: `txn_payout_${Date.now()}`,
      description: "Payout to linked bank account",
      type: "payout",
      status: "pending",
      amount: -amount,
      currency: summary.currency,
      occurredAt: new Date().toISOString(),
    };

    setTransactions((current) => [payout, ...current]);
    setBalance((current) => toCents(current - amount));
    setPaidOut(true);
    setConfirmOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Banknote className="size-4" />
              Available balance
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <p className="text-3xl font-semibold tracking-tight tabular-nums">
                {formatCurrency(balance, summary.currency)}
              </p>
              {paidOut && (
                <p className="text-xs text-muted-foreground">
                  Payout requested. This demo does not persist - reload to
                  reset.
                </p>
              )}
            </div>

            <Button
              onClick={openDialog}
              disabled={!canWithdraw}
              aria-label={
                canWithdraw
                  ? "Withdraw funds"
                  : "No funds available to withdraw"
              }
            >
              Withdraw funds
            </Button>
          </CardContent>
        </Card>

        <SummaryCard
          icon={<Clock className="size-4" />}
          label="Pending earnings"
          value={formatCurrency(summary.pendingEarnings, summary.currency)}
          hint="Clears once the platform settles"
        />
        <SummaryCard
          icon={<TrendingUp className="size-4" />}
          label="Lifetime earned"
          value={formatCurrency(summary.lifetimeEarnings, summary.currency)}
          hint="Across all connected accounts"
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Transaction history</h2>
        <TransactionHistory transactions={transactions} />
      </section>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw funds</DialogTitle>
            <DialogDescription>
              Choose how much to send to your linked bank account. Funds
              typically arrive in 2-3 business days.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              confirmPayout();
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="payout-amount" className="text-sm font-medium">
                Amount
              </label>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => setAmountInput(balance.toFixed(2))}
              >
                Withdraw all ({formatCurrency(balance, summary.currency)})
              </Button>
            </div>

            <Input
              id="payout-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max={balance}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              aria-invalid={error !== null}
              aria-describedby="payout-amount-help"
            />

            <p
              id="payout-amount-help"
              className={
                error
                  ? "text-xs text-destructive"
                  : "text-xs text-muted-foreground"
              }
              role={error ? "alert" : undefined}
            >
              {error ??
                formatCurrency(toCents(balance - amount), summary.currency) +
                  " will remain in your balance."}
            </p>
          </form>

          <p className="text-xs text-muted-foreground">
            This is a demo - no real transfer is made.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmPayout} disabled={error !== null}>
              {error
                ? "Withdraw"
                : "Withdraw " + formatCurrency(amount, summary.currency)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getAmountError(
  raw: string,
  amount: number,
  balance: number,
  currency: string,
): string | null {
  if (raw.trim() === "") return "Enter an amount.";
  if (!Number.isFinite(amount)) return "Enter a valid number.";
  if (amount <= 0) return "Amount must be greater than zero.";
  if (amount > balance) {
    return (
      "You can withdraw at most " + formatCurrency(balance, currency) + "."
    );
  }
  return null;
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
