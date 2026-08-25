# Streamer Portal

A portal for streamers, built as a single Next.js application: React on the
front, Node on the back, deployed to Vercel.

## Stack

| Layer      | Choice                                                               |
| ---------- | -------------------------------------------------------------------- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router)                        |
| UI         | React 19, TypeScript (strict)                                        |
| Styling    | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (Radix), Lucide |
| Backend    | Next.js Route Handlers (Node runtime) under `src/app/api`            |
| Tooling    | ESLint 9, Prettier 3                                                 |
| CI         | GitHub Actions (`.github/workflows/ci.yml`)                          |
| Deployment | [Vercel](https://vercel.com) (zero-config)                           |

## Prerequisites

- Node.js 20 or newer
- npm 9 or newer

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in any values you need
npm run dev
```

Open http://localhost:3000. The landing page calls `/api/health` and shows the
result, so a green `ok` badge means the frontend and backend are talking.

## Scripts

| Script                 | What it does                                |
| ---------------------- | ------------------------------------------- |
| `npm run dev`          | Start the dev server on port 3000           |
| `npm run build`        | Production build                            |
| `npm run start`        | Serve the production build                  |
| `npm run lint`         | ESLint                                      |
| `npm run lint:fix`     | ESLint with autofix                         |
| `npm run typecheck`    | `tsc --noEmit`                              |
| `npm run format`       | Prettier, write                             |
| `npm run format:check` | Prettier, check only (this is what CI runs) |

## Layout

```
.github/workflows/ci.yml   Lint + typecheck + build on push and PR
src/
  app/
    api/health/route.ts    Backend route handler (Node)
    layout.tsx             Root layout, fonts, metadata
    page.tsx               Landing page (server component)
    globals.css            Tailwind v4 entry + design tokens
  components/
    health-status.tsx      Client component that calls the API
    ui/                    shadcn/ui primitives (generated - do not hand-edit)
  lib/
    types.ts               Shared frontend/backend API contracts
    utils.ts               `cn()` class-merge helper
components.json            shadcn/ui configuration
.env.example               Documented environment variables
```

### Conventions

- Every API route's response shape lives in `src/lib/types.ts` and is imported by
  both the route handler and its consumers, so the contract is checked at compile
  time on both sides.
- Server components by default; add `"use client"` only where interactivity or
  browser APIs are actually needed.
- Compose conditional classes with `cn()` from `src/lib/utils.ts`.
- Add UI primitives with `npx shadcn@latest add <component>` rather than writing
  them by hand. Files under `src/components/ui/` are generated and are excluded
  from linting and formatting.

## Adding a backend endpoint

1. Define the response type in `src/lib/types.ts`.
2. Create `src/app/api/<name>/route.ts` exporting `GET`/`POST`/etc.
3. Consume it from a component, typing the parsed JSON with that shared type.

`src/app/api/health/route.ts` and `src/components/health-status.tsx` are the
reference pair.

## Payouts

> [!WARNING]
> **There is no authentication.** The streamer is resolved server-side and is
> never read from the request, so a caller cannot pay out from someone else's
> balance — but anyone who can reach `POST /api/payouts` can drain _this_
> streamer's balance. **Do not deploy publicly as-is.** Auth is out of scope
> (see `CLAUDE.md`); this is the blocker to lift first.

The wallet is a real ledger, not a mocked number.

**Balance is never stored.** It is `SUM(amount_cents)` over completed rows in
`transactions`, so the balance and the history cannot disagree. Pending entries
are not spendable; failed entries never happened.

**Money is integer cents** everywhere except the display edge. Floats are never
used for money.

**Requesting a payout** (`src/lib/payouts/service.ts`) rests on two guarantees,
both enforced by Postgres rather than application code that could race:

1. `SELECT … FOR UPDATE` on the streamer row serialises concurrent payouts, so
   two requests cannot both read the same balance and both pass the
   sufficient-funds check.
2. A `UNIQUE` index on `payout_requests.idempotency_key` makes a duplicate
   insert impossible. Retrying with the same key replays the original result.

```
POST /api/payouts
Idempotency-Key: <uuid>
{ "amountCents": 50000 }

201  created          200  replayed
400  invalid amount / insufficient funds
409  key reused with a different amount
```

The client generates one key per payout attempt and reuses it across retries —
that is what makes a retry safe after a timeout.

### Database setup

```bash
vercel env pull .env.development.local   # or set POSTGRES_URL in .env.local
npm run db:generate                      # build the migration from the schema
npm run db:migrate                       # apply it
npm run db:seed                          # streamer + opening balance + history
```

`POSTGRES_URL` is the pooled connection the app uses;
`POSTGRES_URL_NON_POOLING` is the direct one migrations need, because
pgBouncer's transaction mode cannot run DDL.

Without a database, `/` and `/wallet` return 500 — both read live ledger state.
`/posts` is unaffected.

### Payment provider

Payout delivery sits behind the `PayoutProvider` interface, so swapping vendors
means writing one adapter and leaving the domain alone.

- **Mock provider** — the default. Moves no money. The app runs with no Stripe
  account at all.
- **Stripe Connect** — used automatically once `STRIPE_API_KEY` and
  `STRIPE_CONNECT_ACCOUNT_ID` are set.

The connected account must be created with **Accounts v2**
(`POST /v2/core/accounts`) using `configuration.recipient` requesting the
`stripe_balance.stripe_transfers` capability and `dashboard: "express"`. The
older `accounts.create({ type: "express" })` form is a deprecated v1 pattern.
The adapter checks that capability is `active` before moving money.

Because this portal only pays money out, do **not** request
`configuration.merchant` or `card_payments` — it only lengthens onboarding.

Prefer a **restricted key** (`rk_…`) over a secret key, scoped to
_Transfers: write_ and _Connected accounts: read_. On Vercel, mark it a
Sensitive environment variable. No Stripe account? `npm i -g @stripe/cli &&
stripe sandbox create` issues test keys without registering.

Payout status is settled by `POST /api/webhooks/stripe`, which verifies the
signature against the raw request body.

## Environment variables

Copy `.env.example` to `.env.local` for local development; `.env*` files are
gitignored. For deployed environments, set the same variables in the Vercel
project settings. Only variables prefixed with `NEXT_PUBLIC_` are exposed to the
browser.

## Deployment

Vercel detects Next.js automatically, so no `vercel.json` is needed.

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Leave the framework preset as the auto-detected **Next.js**.
3. Add the environment variables from `.env.example` under
   Settings -> Environment Variables.

Pushes to `main` deploy to production; every other branch and pull request gets
a preview deployment.
