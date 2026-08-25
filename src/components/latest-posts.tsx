import { PostRow } from "@/components/post-row";
import { Card, CardContent } from "@/components/ui/card";
import type { Post } from "@/lib/types";

export function LatestPosts({ posts }: { posts: Post[] }) {
  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {posts.map((post) => (
          <PostRow key={post.id} post={post} />
        ))}
      </CardContent>
    </Card>
  );
}
