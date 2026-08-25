"use client";

import { useState } from "react";
import { Clock, Eye, Users } from "lucide-react";

import { PlatformBadge } from "@/components/platform-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCompact, formatDateTime } from "@/lib/format";
import { getPlatform } from "@/lib/platforms";
import type { ConnectedAccount } from "@/lib/types";

export function ConnectedAccounts({
  accounts,
}: {
  accounts: ConnectedAccount[];
}) {
  // One dialog for the whole grid, driven by which card was clicked.
  const [selected, setSelected] = useState<ConnectedAccount | null>(null);
  const selectedMeta = selected ? getPlatform(selected.platform) : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((account) => {
          const meta = getPlatform(account.platform);

          return (
            <Card key={account.id} className="p-0">
              <button
                type="button"
                onClick={() => setSelected(account)}
                aria-label={`View ${meta.label} account details`}
                className="h-full w-full cursor-pointer rounded-xl text-left transition-colors hover:bg-muted/50 focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
              >
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <PlatformBadge platform={account.platform} />
                    <Badge variant="secondary">Connected</Badge>
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-medium">{meta.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{account.handle}
                    </p>
                  </div>

                  <p className="text-sm tabular-nums">
                    <span className="font-semibold">
                      {formatCompact(account.followers)}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {meta.audienceLabel.toLowerCase()}
                    </span>
                  </p>
                </CardContent>
              </button>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          {selected && selectedMeta && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <PlatformBadge platform={selected.platform} size="lg" />
                  <div className="space-y-0.5 text-left">
                    <DialogTitle>{selectedMeta.label}</DialogTitle>
                    <DialogDescription>@{selected.handle}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <dl className="divide-y divide-border">
                <DetailRow
                  icon={<Users className="size-4" />}
                  label={selectedMeta.audienceLabel}
                  value={formatCompact(selected.followers)}
                />
                <DetailRow
                  icon={<Eye className="size-4" />}
                  label="Views"
                  value={formatCompact(selected.views)}
                />
                <DetailRow
                  icon={<Clock className="size-4" />}
                  label="Last sync"
                  value={formatDateTime(selected.lastSyncedAt)}
                />
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium tabular-nums">{value}</dd>
    </div>
  );
}
