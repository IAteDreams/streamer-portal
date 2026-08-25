import { getPlatform } from "@/lib/platforms";
import type { PlatformId } from "@/lib/types";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { tile: "size-8", icon: "size-4" },
  lg: { tile: "size-10", icon: "size-5" },
};

/**
 * Brand-colored tile carrying the platform's logo. Marks are Simple Icons via
 * react-icons - lucide dropped its brand icons in v1.
 */
export function PlatformBadge({
  platform,
  size = "sm",
  className,
}: {
  platform: PlatformId;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const meta = getPlatform(platform);
  const Icon = meta.icon;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg",
        meta.className,
        SIZES[size].tile,
        className,
      )}
    >
      <Icon className={SIZES[size].icon} />
    </span>
  );
}
