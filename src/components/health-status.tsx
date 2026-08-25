"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HealthResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

type State =
  | { kind: "ready"; data: HealthResponse; source: "server" | "api" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export function HealthStatus({ initial }: { initial: HealthResponse }) {
  const [state, setState] = useState<State>({
    kind: "ready",
    data: initial,
    source: "server",
  });

  async function recheck() {
    setState({ kind: "loading" });

    try {
      const res = await fetch("/api/health", { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as HealthResponse;
      setState({ kind: "ready", data, source: "api" });
    } catch (error) {
      setState({
        kind: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Backend status</CardTitle>
        <CardDescription>
          {state.kind === "ready" && state.source === "server"
            ? "Rendered on the server. Re-check to call /api/health from the browser."
            : "Live response from /api/health"}
        </CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void recheck()}
            disabled={state.kind === "loading"}
          >
            <RefreshCw
              className={cn(state.kind === "loading" && "animate-spin")}
            />
            Re-check
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {state.kind === "loading" && (
          <p className="text-sm text-muted-foreground">Checking...</p>
        )}

        {state.kind === "error" && (
          <div className="space-y-2">
            <Badge variant="destructive">unreachable</Badge>
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </div>
        )}

        {state.kind === "ready" && (
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <Badge
                variant={state.data.status === "ok" ? "default" : "destructive"}
              >
                {state.data.status}
              </Badge>
            </dd>

            <dt className="text-muted-foreground">Service</dt>
            <dd className="font-mono text-xs">{state.data.service}</dd>

            <dt className="text-muted-foreground">Environment</dt>
            <dd className="font-mono text-xs">{state.data.environment}</dd>

            <dt className="text-muted-foreground">Source</dt>
            <dd className="font-mono text-xs">
              {state.source === "server" ? "server render" : "GET /api/health"}
            </dd>

            <dt className="text-muted-foreground">Checked at</dt>
            <dd className="font-mono text-xs">{state.data.timestamp}</dd>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
