import type { Streamer } from "@/lib/types";

/**
 * The one hardcoded streamer the portal renders for. Authentication is out of
 * scope, so the app assumes this account is always signed in - call
 * `getCurrentStreamer()` anywhere a real app would read a session.
 */
const CURRENT_STREAMER: Streamer = {
  id: "str_01",
  displayName: "Aria Vance",
  handle: "ariavance",
  email: "aria@streamerportal.dev",
};

export function getCurrentStreamer(): Streamer {
  return CURRENT_STREAMER;
}

/** Initials used as the avatar fallback, e.g. "Aria Vance" -> "AV". */
export function getInitials(streamer: Streamer): string {
  return streamer.displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
