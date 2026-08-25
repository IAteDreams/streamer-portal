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

/** The signed-in streamer. Auth is out of scope: this comes from mock data. */
export interface Streamer {
  id: string;
  displayName: string;
  handle: string;
  email: string;
  /** Optional remote image; the avatar falls back to initials when absent. */
  avatarUrl?: string;
}

/** Platforms the portal knows how to display. */
export type PlatformId = "twitch" | "youtube" | "tiktok" | "x";

/** A platform account the streamer has linked. */
export interface ConnectedAccount {
  id: string;
  platform: PlatformId;
  handle: string;
  followers: number;
  views: number;
  /** ISO 8601, rendered as an absolute UTC timestamp. */
  lastSyncedAt: string;
}

/** A single post from one connected account. */
export interface Post {
  id: string;
  platform: PlatformId;
  title: string;
  /** ISO 8601. */
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
}

export interface WalletSummary {
  balance: number;
  pendingEarnings: number;
  /** ISO 4217 code, e.g. "USD". */
  currency: string;
}

/** Aggregated headline numbers for the dashboard metric tiles. */
export interface DashboardMetrics {
  totalFollowers: number;
  totalViews: number;
  balance: number;
  currency: string;
  /** Percent change vs the prior 30 days, e.g. 12.4 or -3.1. */
  followersDelta: number;
  viewsDelta: number;
  balanceDelta: number;
}
