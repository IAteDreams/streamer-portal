import type { IconType } from "react-icons";
import { SiTiktok, SiTwitch, SiX, SiYoutube } from "react-icons/si";

import type { PlatformId } from "@/lib/types";

export interface PlatformMeta {
  label: string;
  /** Official brand mark, from the Simple Icons set in react-icons. */
  icon: IconType;
  /**
   * Tile colors. The hex values are brand colors rather than theme tokens, so
   * they are intentionally literal - everything else on the page uses semantic
   * tokens.
   */
  className: string;
  /** What this platform calls its audience. */
  audienceLabel: string;
}

export const PLATFORMS: Record<PlatformId, PlatformMeta> = {
  twitch: {
    label: "Twitch",
    icon: SiTwitch,
    className: "bg-[#9146FF] text-white",
    audienceLabel: "Followers",
  },
  youtube: {
    label: "YouTube",
    icon: SiYoutube,
    className: "bg-[#FF0000] text-white",
    audienceLabel: "Subscribers",
  },
  tiktok: {
    label: "TikTok",
    icon: SiTiktok,
    className: "bg-foreground text-background",
    audienceLabel: "Followers",
  },
  x: {
    label: "X",
    icon: SiX,
    className: "bg-foreground text-background",
    audienceLabel: "Followers",
  },
};

export function getPlatform(id: PlatformId): PlatformMeta {
  return PLATFORMS[id];
}
