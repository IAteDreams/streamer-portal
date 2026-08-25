import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDelta } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  delta,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
}) {
  const isUp = delta >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon className="size-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p
          className={cn(
            "flex items-center gap-1 text-xs",
            isUp
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive",
          )}
        >
          <TrendIcon className="size-3.5" />
          <span className="tabular-nums">{formatDelta(delta)}</span>
          <span className="text-muted-foreground">vs last 30 days</span>
        </p>
      </CardContent>
    </Card>
  );
}
