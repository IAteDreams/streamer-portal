import { Eye, Heart, MessageCircle } from "lucide-react";

import { PlatformBadge } from "@/components/platform-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCompact, formatDate } from "@/lib/format";
import { getPlatform } from "@/lib/platforms";
import type { Post } from "@/lib/types";

export function LatestPosts({ posts }: { posts: Post[] }) {
  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {posts.map((post) => {
          const meta = getPlatform(post.platform);

          return (
            <article
              key={post.id}
              className="flex items-start gap-3 px-4 py-3 sm:items-center"
            >
              <PlatformBadge platform={post.platform} />

              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-medium">{post.title}</p>
                <p className="text-xs text-muted-foreground">
                  {meta.label} &middot; {formatDate(post.publishedAt)}
                </p>
              </div>

              <dl className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground tabular-nums sm:gap-4">
                <Stat
                  icon={<Eye className="size-3.5" />}
                  label="views"
                  value={formatCompact(post.views)}
                />
                <Stat
                  icon={<Heart className="size-3.5" />}
                  label="likes"
                  value={formatCompact(post.likes)}
                />
                <Stat
                  icon={<MessageCircle className="size-3.5" />}
                  label="comments"
                  value={formatCompact(post.comments)}
                />
              </dl>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <dt className="flex items-center">
        {icon}
        <span className="sr-only">{label}</span>
      </dt>
      <dd>{value}</dd>
    </div>
  );
}
