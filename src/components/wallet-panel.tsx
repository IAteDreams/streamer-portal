"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Banknote, Clock, Loader2, TrendingUp } from "lucide-react";

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
import { formatCentsCurrency, parseCents } from "@/lib/format";
import type { Transaction, WalletSummary } from "@/lib/types";

export function WalletPanel({
  summary,
  transactions,
}: {
  summary: WalletSummary;
  transactions: Transaction[];
}) {
  const router = useRouter();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // One key per payout attempt, reused across retries. Reusing it is the whole
  // point: a retry after a timeout replays the original payout instead of
  // creating a second one.
  const [idempotencyKey, setIdempotencyKey] = useState("");

  const balanceCents = summary.balanceCents;
  const canWithdraw = balanceCents > 0;

  // Held as a string so partial input stays editable; the parsed value drives
  // validation. This is UX only - the server check in requestPayout() is
  // authoritative.
  const amountCents = parseCents(amountInput);
  const clientError = getAmountError(
    amountInput,
    amountCents,
    balanceCents,
    summary.currency,
  );

  function openDialog() {
    setAmountInput((balanceCents / 100).toFixed(2));
    setIdempotencyKey(crypto.randomUUID());
    setServerError(null);
    setConfirmOpen(true);
  }

  async function submitPayout() {
    if (clientError || submitting) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const response = await fetch("/api/payouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ amountCents }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          typeof body === "object" && body !== null && "error" in body
            ? String((body as { error: unknown }).error)
            : "Payout failed. Please try again.";
        setServerError(message);
        return;
      }

      setConfirmOpen(false);
      // Re-fetch the server components so balance and history update together
      // from the same derived source.
      router.refresh();
    } catch {
      setServerError(
        "Could not reach the server. Retrying is safe - this request has an idempotency key.",
      );
    } finally {
      setSubmitting(false);
    }
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
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              {formatCentsCurrency(balanceCents, summary.currency)}
            </p>

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
          value={formatCentsCurrency(
            summary.pendingEarningsCents,
            summary.currency,
          )}
          hint="Not spendable until it settles"
        />
        <SummaryCard
          icon={<TrendingUp className="size-4" />}
          label="Lifetime earned"
          value={formatCentsCurrency(
            summary.lifetimeEarningsCents,
            summary.currency,
          )}
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
              void submitPayout();
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
                onClick={() => setAmountInput((balanceCents / 100).toFixed(2))}
              >
                Withdraw all (
                {formatCentsCurrency(balanceCents, summary.currency)})
              </Button>
            </div>

            <Input
              id="payout-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max={balanceCents / 100}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              aria-invalid={clientError !== null}
              aria-describedby="payout-amount-help"
              disabled={submitting}
            />

            <p
              id="payout-amount-help"
              className={
                clientError
                  ? "text-xs text-destructive"
                  : "text-xs text-muted-foreground"
              }
              role={clientError ? "alert" : undefined}
            >
              {clientError ??
                formatCentsCurrency(
                  balanceCents - amountCents,
                  summary.currency,
                ) + " will remain in your balance."}
            </p>

            {serverError && (
              <p className="text-xs text-destructive" role="alert">
                {serverError}
              </p>
            )}
          </form>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void submitPayout()}
              disabled={clientError !== null || submitting}
            >
              {submitting && <Loader2 className="animate-spin" />}
              {clientError
                ? "Withdraw"
                : "Withdraw " +
                  formatCentsCurrency(amountCents, summary.currency)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getAmountError(
  raw: string,
  amountCents: number,
  balanceCents: number,
  currency: string,
): string | null {
  if (raw.trim() === "") return "Enter an amount.";
  if (!Number.isFinite(amountCents)) return "Enter a valid number.";
  if (amountCents <= 0) return "Amount must be greater than zero.";
  if (amountCents > balanceCents) {
    return (
      "You can withdraw at most " +
      formatCentsCurrency(balanceCents, currency) +
      "."
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
