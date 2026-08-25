import { Eye, Users, Wallet } from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { formatCentsCurrency, formatCompact } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/types";

export function DashboardMetricsRow({
  metrics,
}: {
  metrics: DashboardMetrics;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        label="Total followers"
        value={formatCompact(metrics.totalFollowers)}
        delta={metrics.followersDelta}
        icon={Users}
      />
      <MetricCard
        label="Total views"
        value={formatCompact(metrics.totalViews)}
        delta={metrics.viewsDelta}
        icon={Eye}
      />
      <MetricCard
        label="Balance"
        value={formatCentsCurrency(metrics.balanceCents, metrics.currency)}
        delta={metrics.balanceDelta}
        icon={Wallet}
      />
    </div>
  );
}
