import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate, formatSignedCurrency } from "@/lib/format";
import type { Transaction, TransactionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<
  TransactionStatus,
  "secondary" | "outline" | "destructive"
> = {
  completed: "secondary",
  pending: "outline",
  failed: "destructive",
};

const STATUS_LABEL: Record<TransactionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
};

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isMoneyIn = transaction.amount > 0;
  const Icon = isMoneyIn ? ArrowDownLeft : ArrowUpRight;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isMoneyIn
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-medium">
          {transaction.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.occurredAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={cn(
            "text-sm font-medium tabular-nums",
            isMoneyIn && transaction.status !== "failed"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-foreground",
            transaction.status === "failed" && "line-through opacity-60",
          )}
        >
          {formatSignedCurrency(transaction.amount, transaction.currency)}
        </span>
        <Badge variant={STATUS_VARIANT[transaction.status]}>
          {STATUS_LABEL[transaction.status]}
        </Badge>
      </div>
    </div>
  );
}
