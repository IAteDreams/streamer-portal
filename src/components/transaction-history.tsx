import { Receipt } from "lucide-react";

import { TransactionRow } from "@/components/transaction-row";
import { Card, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/lib/types";

export function TransactionHistory({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <Receipt className="size-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Earnings and payouts will appear here once they land.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </CardContent>
    </Card>
  );
}
