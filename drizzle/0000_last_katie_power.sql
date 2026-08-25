CREATE TYPE "public"."payout_status" AS ENUM('pending', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('completed', 'pending', 'failed');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('earning', 'payout', 'adjustment');--> statement-breakpoint
CREATE TABLE "payout_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"streamer_id" uuid NOT NULL,
	"idempotency_key" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"status" "payout_status" NOT NULL,
	"provider_ref" text,
	"transaction_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streamers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"display_name" text NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"streamer_id" uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"description" text NOT NULL,
	"provider_ref" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_streamer_id_streamers_id_fk" FOREIGN KEY ("streamer_id") REFERENCES "public"."streamers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "payout_requests_idempotency_key_idx" ON "payout_requests" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "transactions_streamer_occurred_idx" ON "transactions" USING btree ("streamer_id","occurred_at" DESC NULLS LAST);