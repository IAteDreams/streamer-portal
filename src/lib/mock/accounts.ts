import type { ConnectedAccount } from "@/lib/types";

/**
 * The platform accounts the streamer has linked. Only connected accounts exist
 * here - linking a new platform would need auth, which is out of scope.
 */
const CONNECTED_ACCOUNTS: ConnectedAccount[] = [
  {
    id: "acc_twitch",
    platform: "twitch",
    handle: "ariavance",
    followers: 128_412,
    views: 3_284_910,
    lastSyncedAt: "2026-08-25T08:42:00.000Z",
  },
  {
    id: "acc_youtube",
    platform: "youtube",
    handle: "AriaVanceLive",
    followers: 84_137,
    views: 5_912_664,
    lastSyncedAt: "2026-08-25T07:15:00.000Z",
  },
  {
    id: "acc_tiktok",
    platform: "tiktok",
    handle: "aria.vance",
    followers: 212_908,
    views: 9_447_301,
    lastSyncedAt: "2026-08-24T22:03:00.000Z",
  },
  {
    id: "acc_x",
    platform: "x",
    handle: "ariavance",
    followers: 31_642,
    views: 742_188,
    lastSyncedAt: "2026-08-25T06:28:00.000Z",
  },
];

export function getConnectedAccounts(): ConnectedAccount[] {
  return CONNECTED_ACCOUNTS;
}
