import { ConnectedAccounts } from "@/components/connected-accounts";
import { DashboardMetricsRow } from "@/components/dashboard-metrics";
import { LatestPosts } from "@/components/latest-posts";
import { getDashboardMetrics } from "@/lib/dashboard";
import { getConnectedAccounts } from "@/lib/mock/accounts";
import { getLatestPosts } from "@/lib/mock/posts";
import { getCurrentStreamer } from "@/lib/mock/streamer";

// Rendered per request so the figures are never baked in at build time.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const streamer = getCurrentStreamer();
  const firstName = streamer.displayName.split(" ")[0];
  const accounts = getConnectedAccounts();
  const posts = getLatestPosts();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Good to see you, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is how your channels are doing across {accounts.length} connected
          accounts.
        </p>
      </header>

      <DashboardMetricsRow metrics={await getDashboardMetrics()} />

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Connected accounts</h2>
        <ConnectedAccounts accounts={accounts} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium">Latest posts</h2>
        <LatestPosts posts={posts} />
      </section>
    </div>
  );
}
