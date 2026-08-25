import { daysAgo } from "@/lib/mock/dates";
import type { Post, PlatformId } from "@/lib/types";

interface PostSeed {
  platform: PlatformId;
  title: string;
  days: number;
  hour: number;
  views: number;
  likes: number;
  comments: number;
}

const SEEDS: PostSeed[] = [
  // Last 7 days
  {
    platform: "tiktok",
    title: "That clutch nobody saw coming",
    days: 0,
    hour: 16,
    views: 318_402,
    likes: 41_920,
    comments: 2_144,
  },
  {
    platform: "twitch",
    title: "Late night ranked grind - road to Diamond",
    days: 0,
    hour: 21,
    views: 42_318,
    likes: 3_204,
    comments: 812,
  },
  {
    platform: "youtube",
    title: "My full streaming setup for 2026 (budget breakdown)",
    days: 1,
    hour: 14,
    views: 96_744,
    likes: 8_112,
    comments: 1_037,
  },
  {
    platform: "x",
    title: "Schedule change: streaming Tue/Thu/Sat next week",
    days: 2,
    hour: 11,
    views: 18_902,
    likes: 1_488,
    comments: 226,
  },
  {
    platform: "youtube",
    title: "Reacting to your clips - community submissions #14",
    days: 3,
    hour: 18,
    views: 64_211,
    likes: 5_390,
    comments: 744,
  },
  {
    platform: "tiktok",
    title: "Three settings that fixed my aim",
    days: 4,
    hour: 9,
    views: 221_064,
    likes: 27_881,
    comments: 1_602,
  },
  {
    platform: "twitch",
    title: "Subathon day 3 - we hit the goal",
    days: 5,
    hour: 20,
    views: 88_140,
    likes: 6_902,
    comments: 3_418,
  },
  {
    platform: "x",
    title: "New emotes are live, go grab them",
    days: 6,
    hour: 13,
    views: 24_506,
    likes: 2_110,
    comments: 184,
  },

  // 8-30 days
  {
    platform: "youtube",
    title: "Every ranked mistake I made this season",
    days: 8,
    hour: 15,
    views: 142_889,
    likes: 11_402,
    comments: 1_918,
  },
  {
    platform: "tiktok",
    title: "POV: your teammate has no mic",
    days: 9,
    hour: 19,
    views: 512_770,
    likes: 78_204,
    comments: 4_930,
  },
  {
    platform: "twitch",
    title: "First playthrough - no spoilers please",
    days: 11,
    hour: 22,
    views: 36_004,
    likes: 2_788,
    comments: 641,
  },
  {
    platform: "x",
    title: "Thanks for 30K, genuinely did not expect that",
    days: 12,
    hour: 10,
    views: 41_338,
    likes: 5_902,
    comments: 508,
  },
  {
    platform: "youtube",
    title: "Building the ultimate budget PC on stream",
    days: 14,
    hour: 16,
    views: 208_412,
    likes: 18_330,
    comments: 2_244,
  },
  {
    platform: "tiktok",
    title: "The comeback nobody believed in",
    days: 16,
    hour: 12,
    views: 388_190,
    likes: 52_014,
    comments: 3_106,
  },
  {
    platform: "twitch",
    title: "Community game night - viewer lobbies",
    days: 18,
    hour: 20,
    views: 51_226,
    likes: 4_118,
    comments: 1_290,
  },
  {
    platform: "youtube",
    title: "Answering your questions about going full time",
    days: 20,
    hour: 17,
    views: 118_540,
    likes: 14_806,
    comments: 2_871,
  },
  {
    platform: "x",
    title: "Quick poll: what should I play Saturday?",
    days: 22,
    hour: 9,
    views: 15_774,
    likes: 1_204,
    comments: 402,
  },
  {
    platform: "tiktok",
    title: "Editing my own clips is a full time job",
    days: 24,
    hour: 14,
    views: 174_902,
    likes: 21_440,
    comments: 1_188,
  },
  {
    platform: "twitch",
    title: "Charity stream - 12 hour marathon",
    days: 26,
    hour: 8,
    views: 132_918,
    likes: 12_004,
    comments: 5_612,
  },
  {
    platform: "youtube",
    title: "How I plan a week of content in two hours",
    days: 28,
    hour: 15,
    views: 74_206,
    likes: 6_918,
    comments: 902,
  },

  // 31-90 days
  {
    platform: "tiktok",
    title: "Nobody warned me about this boss",
    days: 33,
    hour: 18,
    views: 296_118,
    likes: 34_902,
    comments: 2_016,
  },
  {
    platform: "x",
    title: "Stream schedule for next month is up",
    days: 36,
    hour: 11,
    views: 12_408,
    likes: 940,
    comments: 118,
  },
  {
    platform: "twitch",
    title: "Ranked with viewers - climbing from Gold",
    days: 41,
    hour: 21,
    views: 44_702,
    likes: 3_506,
    comments: 988,
  },
  {
    platform: "youtube",
    title: "My honest review of the new headset",
    days: 45,
    hour: 13,
    views: 162_330,
    likes: 13_774,
    comments: 1_640,
  },
  {
    platform: "tiktok",
    title: "Speedrun attempt that actually worked",
    days: 52,
    hour: 16,
    views: 441_206,
    likes: 61_118,
    comments: 3_882,
  },
  {
    platform: "twitch",
    title: "Trying the game everyone told me to play",
    days: 58,
    hour: 19,
    views: 29_884,
    likes: 2_206,
    comments: 470,
  },
  {
    platform: "youtube",
    title: "Six months of streaming - what actually changed",
    days: 63,
    hour: 14,
    views: 254_770,
    likes: 28_902,
    comments: 4_118,
  },
  {
    platform: "x",
    title: "Setup photos, since everyone keeps asking",
    days: 70,
    hour: 10,
    views: 33_190,
    likes: 4_006,
    comments: 288,
  },
  {
    platform: "tiktok",
    title: "One tip that doubled my clip views",
    days: 78,
    hour: 15,
    views: 208_664,
    likes: 25_330,
    comments: 1_474,
  },
  {
    platform: "youtube",
    title: "Reviewing my first ever stream (painful)",
    days: 86,
    hour: 17,
    views: 91_442,
    likes: 10_118,
    comments: 1_806,
  },
];

/**
 * Built per call rather than once at module load, so the relative publish dates
 * track the current request instead of freezing when the server started.
 */
function buildPosts(): Post[] {
  return SEEDS.map((seed, i) => ({
    id: `post_${String(i + 1).padStart(2, "0")}`,
    platform: seed.platform,
    title: seed.title,
    publishedAt: daysAgo(seed.days, seed.hour),
    views: seed.views,
    likes: seed.likes,
    comments: seed.comments,
  })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/** Every post, newest first. */
export function getAllPosts(): Post[] {
  return buildPosts();
}

/** Newest first. Sorted here so callers never have to. */
export function getLatestPosts(limit = 5): Post[] {
  return buildPosts().slice(0, limit);
}
