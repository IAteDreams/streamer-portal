import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { daysAgo } from "../src/lib/mock/dates";
import * as schema from "../src/lib/db/schema";

config({ path: ".env.development.local" });
config({ path: ".env.local" });

const CURRENCY = "USD";

/**
 * Balances the ledger so the derived available balance lands on the familiar
 * $12,480.55: the 14 historical rows below net to -$526.30 completed.
 */
const OPENING_BALANCE_CENTS = 1_300_685;

interface Seed {
  description: string;
  type: "earning" | "payout" | "adjustment";
  status: "completed" | "pending" | "failed";
  cents: number;
  days: number;
  hour: number;
}

const SEEDS: Seed[] = [
  {
    description: "Subscription revenue - August",
    type: "earning",
    status: "completed",
    cents: 84_210,
    days: 1,
    hour: 9,
  },
  {
    description: "Bits and cheers",
    type: "earning",
    status: "completed",
    cents: 31_840,
    days: 2,
    hour: 14,
  },
  {
    description: "Brand deal - headset review",
    type: "earning",
    status: "pending",
    cents: 250_000,
    days: 3,
    hour: 11,
  },
  {
    description: "Ad revenue share",
    type: "earning",
    status: "completed",
    cents: 120_475,
    days: 5,
    hour: 8,
  },
  {
    description: "Payout to linked bank account",
    type: "payout",
    status: "completed",
    cents: -500_000,
    days: 8,
    hour: 10,
  },
  {
    description: "Channel memberships",
    type: "earning",
    status: "completed",
    cents: 96_430,
    days: 11,
    hour: 16,
  },
  {
    description: "Chargeback adjustment",
    type: "adjustment",
    status: "completed",
    cents: -12_850,
    days: 14,
    hour: 13,
  },
  {
    description: "Payout to linked bank account",
    type: "payout",
    status: "failed",
    cents: -200_000,
    days: 17,
    hour: 9,
  },
  {
    description: "Subscription revenue - July",
    type: "earning",
    status: "completed",
    cents: 178_890,
    days: 21,
    hour: 9,
  },
  {
    description: "Tournament winnings",
    type: "earning",
    status: "completed",
    cents: 350_000,
    days: 26,
    hour: 20,
  },
  {
    description: "Platform fee correction",
    type: "adjustment",
    status: "completed",
    cents: 6_215,
    days: 31,
    hour: 12,
  },
  {
    description: "Payout to linked bank account",
    type: "payout",
    status: "completed",
    cents: -850_000,
    days: 38,
    hour: 10,
  },
  {
    description: "Bits and cheers",
    type: "earning",
    status: "completed",
    cents: 42_160,
    days: 44,
    hour: 18,
  },
  {
    description: "Brand deal - energy drink",
    type: "earning",
    status: "completed",
    cents: 400_000,
    days: 52,
    hour: 15,
  },
];

async function main() {
  const url =
    process.env.POSTGRES_URL_NON_POOLING ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "No database URL. Run `vercel env pull .env.development.local`, or set POSTGRES_URL in .env.local.",
    );
  }

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client, { schema });

  // Idempotent: wipe and rebuild rather than accumulating duplicates on re-run.
  await db.delete(schema.payoutRequests);
  await db.delete(schema.transactions);
  await db.delete(schema.streamers);

  const [streamer] = await db
    .insert(schema.streamers)
    .values({ displayName: "Aria Vance", currency: CURRENCY })
    .returning({ id: schema.streamers.id });

  await db.insert(schema.transactions).values([
    {
      streamerId: streamer.id,
      type: "adjustment" as const,
      status: "completed" as const,
      amountCents: OPENING_BALANCE_CENTS,
      currency: CURRENCY,
      description: "Opening balance",
      occurredAt: new Date(daysAgo(90, 0)),
    },
    ...SEEDS.map((seed) => ({
      streamerId: streamer.id,
      type: seed.type,
      status: seed.status,
      amountCents: seed.cents,
      currency: CURRENCY,
      description: seed.description,
      occurredAt: new Date(daysAgo(seed.days, seed.hour)),
    })),
  ]);

  const [row] = await client`
    select
      coalesce(sum(amount_cents) filter (where status = 'completed'), 0) as available,
      count(*) as rows
    from transactions
  `;

  console.log("Seeded streamer:", streamer.id);
  console.log("Ledger rows    :", row.rows);
  console.log("Available      : $" + (Number(row.available) / 100).toFixed(2));

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
