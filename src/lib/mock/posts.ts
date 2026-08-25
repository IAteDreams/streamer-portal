import type { Post } from "@/lib/types";

/** Posts from every connected account, merged into one feed. */
const POSTS: Post[] = [
  {
    id: "post_01",
    platform: "twitch",
    title: "Late night ranked grind - road to Diamond",
    publishedAt: "2026-08-24T21:10:00.000Z",
    views: 42_318,
    likes: 3_204,
    comments: 812,
  },
  {
    id: "post_02",
    platform: "tiktok",
    title: "That clutch nobody saw coming",
    publishedAt: "2026-08-24T16:45:00.000Z",
    views: 318_402,
    likes: 41_920,
    comments: 2_144,
  },
  {
    id: "post_03",
    platform: "youtube",
    title: "My full streaming setup for 2026 (budget breakdown)",
    publishedAt: "2026-08-23T14:00:00.000Z",
    views: 96_744,
    likes: 8_112,
    comments: 1_037,
  },
  {
    id: "post_04",
    platform: "x",
    title: "Schedule change: streaming Tue/Thu/Sat starting next week",
    publishedAt: "2026-08-22T11:20:00.000Z",
    views: 18_902,
    likes: 1_488,
    comments: 226,
  },
  {
    id: "post_05",
    platform: "youtube",
    title: "Reacting to your clips - community submissions #14",
    publishedAt: "2026-08-21T18:30:00.000Z",
    views: 64_211,
    likes: 5_390,
    comments: 744,
  },
  {
    id: "post_06",
    platform: "tiktok",
    title: "Three settings that fixed my aim",
    publishedAt: "2026-08-20T09:05:00.000Z",
    views: 221_064,
    likes: 27_881,
    comments: 1_602,
  },
];

/** Newest first. Sorted here so callers never have to. */
export function getLatestPosts(limit = 5): Post[] {
  return [...POSTS]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}
