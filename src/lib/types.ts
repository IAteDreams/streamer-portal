/**
 * Shared contracts between the Node backend (Route Handlers under `src/app/api`)
 * and the React frontend. Every API route should export its response shape here
 * so both sides compile against the same definition.
 */

export type HealthStatus = "ok" | "degraded";

export interface HealthResponse {
  status: HealthStatus;
  service: string;
  environment: string;
  timestamp: string;
}
