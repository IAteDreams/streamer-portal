import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Posts | Streamer Portal",
};

export default function PostsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
      <p className="text-sm text-muted-foreground">
        Recent posts from every connected account will appear here.
      </p>
    </div>
  );
}
