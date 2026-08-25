@AGENTS.md

# Streamer Portal

A sample dashboard for a streamer to see their connected platform accounts, recent
posts across those accounts, and their earnings in one place.

**This is a sample project.** Favor a convincing, complete-feeling UI over
production hardening. Prefer realistic mock data and straightforward code to
abstraction built for scale that will never arrive.

## Scope

Three features, all on the dashboard:

1. **Connected accounts** - list every platform account linked to the streamer
   (platform, handle, avatar, follower count, connection status).
2. **Recent posts** - a single feed merging recent posts from all connected
   accounts, newest first, each showing which account it came from and its
   engagement numbers.
3. **Wallet** - current balance, pending earnings, and a transaction list
   (date, description, type, amount, status).

## Out of scope

Do not build these, and do not add them "while you're in there":

- **Authentication.** No login screen, no session handling, no auth middleware,
  no protected routes.
- **Test coverage.** No test files, no test runner, no testing dependencies.

### Assume the streamer is already logged in

The app boots straight into the dashboard for a single hardcoded streamer. Read
that streamer from a mock module (see below) wherever a real app would read a
session. Do not invent a session layer, a `getCurrentUser()` that reads cookies,
or a "signed out" state - there is no signed-out state.

## Stack

| Layer      | Choice                                                    |
| ---------- | --------------------------------------------------------- |
| Framework  | Next.js 16, App Router, Turbopack                         |
| UI         | React 19, TypeScript (strict)                             |
| Styling    | Tailwind CSS v4, shadcn/ui (radix / nova preset), Lucide  |
| Backend    | Next.js Route Handlers under `src/app/api` (Node runtime) |
| Tooling    | ESLint 9, Prettier 3                                      |
| Deployment | Vercel (zero-config)                                      |

## Commands

```bash
npm run dev            # dev server on :3000
npm run build          # production build
npm run lint           # ESLint
npm run typecheck      # next typegen && tsc --noEmit
npm run format         # Prettier, write
npm run format:check   # Prettier, check only - CI runs this
```

## Notes

- `AGENTS.md` is written and rewritten by `next dev`. Commit its changes with
  your work instead of reverting them.
