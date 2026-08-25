import type { HealthResponse } from "@/lib/types";

/**
 * Single source of truth for the health payload, shared by the API route
 * (`src/app/api/health/route.ts`) and by server components that want the same
 * data without paying for an HTTP round trip.
 */
export function getHealth(): HealthResponse {
  return {
    status: "ok",
    service: "streamer-portal",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  };
}
