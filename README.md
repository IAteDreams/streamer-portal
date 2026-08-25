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
