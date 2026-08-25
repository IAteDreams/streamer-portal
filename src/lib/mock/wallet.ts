import { daysAgo } from "@/lib/mock/dates";
import type {
  Transaction,
  TransactionStatus,
  TransactionType,
  WalletSummary,
} from "@/lib/types";

const CURRENCY = "USD";

/** Wallet headline figures, also read by the dashboard's balance tile. */
const WALLET: WalletSummary = {
  balance: 12_480.55,
  pendingEarnings: 3_215.2,
  lifetimeEarnings: 84_210.0,
  currency: CURRENCY,
};

export function getWalletSummary(): WalletSummary {
  return WALLET;
}

interface TransactionSeed {
  description: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  days: number;
  hour: number;
}

const SEEDS: TransactionSeed[] = [
  {
    description: "Subscription revenue - August",
    type: "earning",
    status: "completed",
    amount: 842.1,
    days: 1,
    hour: 9,
  },
  {
    description: "Bits and cheers",
    type: "earning",
    status: "completed",
    amount: 318.4,
    days: 2,
    hour: 14,
  },
  {
    description: "Brand deal - headset review",
    type: "earning",
    status: "pending",
    amount: 2_500.0,
    days: 3,
    hour: 11,
  },
  {
    description: "Ad revenue share",
    type: "earning",
    status: "completed",
    amount: 1_204.75,
    days: 5,
    hour: 8,
  },
  {
    description: "Payout to linked bank account",
    type: "payout",
    status: "completed",
    amount: -5_000.0,
    days: 8,
    hour: 10,
  },
  {
    description: "Channel memberships",
    type: "earning",
    status: "completed",
    amount: 964.3,
    days: 11,
    hour: 16,
  },
  {
    description: "Chargeback adjustment",
    type: "adjustment",
    status: "completed",
    amount: -128.5,
    days: 14,
    hour: 13,
  },
  {
    description: "Payout to linked bank account",
    type: "payout",
    status: "failed",
    amount: -2_000.0,
    days: 17,
    hour: 9,
  },
  {
    description: "Subscription revenue - July",
    type: "earning",
    status: "completed",
    amount: 1_788.9,
    days: 21,
    hour: 9,
  },
  {
    description: "Tournament winnings",
    type: "earning",
    status: "completed",
    amount: 3_500.0,
    days: 26,
    hour: 20,
  },
  {
    description: "Platform fee correction",
    type: "adjustment",
    status: "completed",
    amount: 62.15,
    days: 31,
    hour: 12,
  },
  {
    description: "Payout to linked bank account",
    type: "payout",
    status: "completed",
    amount: -8_500.0,
    days: 38,
    hour: 10,
  },
  {
    description: "Bits and cheers",
    type: "earning",
    status: "completed",
    amount: 421.6,
    days: 44,
    hour: 18,
  },
  {
    description: "Brand deal - energy drink",
    type: "earning",
    status: "completed",
    amount: 4_000.0,
    days: 52,
    hour: 15,
  },
];

/**
 * Built per call rather than once at module load, so the relative dates track
 * the current request instead of freezing when the server started.
 */
export function getTransactions(): Transaction[] {
  return SEEDS.map((seed, i) => ({
    id: `txn_${String(i + 1).padStart(2, "0")}`,
    description: seed.description,
    type: seed.type,
    status: seed.status,
    amount: seed.amount,
    currency: CURRENCY,
    occurredAt: daysAgo(seed.days, seed.hour),
  })).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}
