import Link from "next/link";
import { FileText } from "lucide-react";

import { PostRow } from "@/components/post-row";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Post } from "@/lib/types";

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <FileText className="size-8 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-medium">No posts match these filters</p>
            <p className="text-sm text-muted-foreground">
              Try a wider date range or a different account.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/posts">Clear filters</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

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
