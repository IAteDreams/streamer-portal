import type { Metadata } from "next";

import { PostFilters } from "@/components/post-filters";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/mock/posts";
import { filterAndSortPosts, parsePostQuery } from "@/lib/posts-query";

export const metadata: Metadata = {
  title: "Posts | Streamer Portal",
};

// Reading searchParams already makes this route dynamic - no force-dynamic needed.
export default async function PostsPage({ searchParams }: PageProps<"/posts">) {
  const query = parsePostQuery(await searchParams);
  const posts = filterAndSortPosts(getAllPosts(), query);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <p className="text-sm text-muted-foreground">
          Everything you have published across your connected accounts.
        </p>
      </header>

      <div className="space-y-3">
        <PostFilters query={query} />
        <p className="text-xs text-muted-foreground" role="status">
          {posts.length} {posts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      <PostList posts={posts} />
    </div>
  );
}
