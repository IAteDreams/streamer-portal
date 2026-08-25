import { HealthStatus } from "@/components/health-status";
import { getHealth } from "@/lib/health";

// Rendered per request so the health timestamp is current, not baked in at build.
export const dynamic = "force-dynamic";

const STACK = [
  "Next.js 16 (App Router)",
  "React 19 + TypeScript",
  "Tailwind CSS v4 + shadcn/ui",
  "Node backend via Route Handlers",
  "Deployed on Vercel",
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Streamer Portal
        </h1>
        <p className="max-w-prose text-muted-foreground">
          Project scaffold is up. The card below is server-rendered from the
          same module the API route uses; hitting Re-check calls{" "}
          <code className="font-mono">/api/health</code> from the browser, which
          confirms the frontend and Node backend are wired together end to end.
        </p>
      </header>

      <HealthStatus initial={getHealth()} />

      <section className="space-y-3">
        <h2 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Stack
        </h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
