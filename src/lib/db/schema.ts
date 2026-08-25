import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const transactionType = pgEnum("transaction_type", [
  "earning",
  "payout",
  "adjustment",
]);

export const transactionStatus = pgEnum("transaction_status", [
  "completed",
  "pending",
  "failed",
]);

export const payoutStatus = pgEnum("payout_status", [
  "pending",
  "paid",
  "failed",
]);

/**
 * Exists so a payout can take a row lock (SELECT ... FOR UPDATE) and serialise
 * concurrent withdrawals for one streamer. Without a row to lock, two requests
 * could both read the same balance and both pass the sufficient-funds check.
 */
export const streamers = pgTable("streamers", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  currency: text("currency").notNull().default("USD"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * The ledger. Balance is never stored - it is derived by summing these rows,
 * so the balance and the history cannot disagree.
 *
 * Amounts are integer minor units (cents), signed: positive for money in,
 * negative for money out. Floats are never used for money.
 */
export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    streamerId: uuid("streamer_id")
      .notNull()
      .references(() => streamers.id, { onDelete: "cascade" }),
    type: transactionType("type").notNull(),
    status: transactionStatus("status").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    description: text("description").notNull(),
    providerRef: text("provider_ref"),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("transactions_streamer_occurred_idx").on(
      table.streamerId,
      table.occurredAt.desc(),
    ),
  ],
);

/**
 * One row per payout attempt. The unique index on idempotency_key is the
 * duplicate guarantee - enforced by Postgres, not by application code that
 * could race between a SELECT and an INSERT.
 */
export const payoutRequests = pgTable(
  "payout_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    streamerId: uuid("streamer_id")
      .notNull()
      .references(() => streamers.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    status: payoutStatus("status").notNull(),
    providerRef: text("provider_ref"),
    transactionId: uuid("transaction_id").references(() => transactions.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("payout_requests_idempotency_key_idx").on(table.idempotencyKey),
  ],
);
