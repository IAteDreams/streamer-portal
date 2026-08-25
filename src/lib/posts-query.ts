import { PLATFORMS } from "@/lib/platforms";
import type { PlatformId, Post } from "@/lib/types";

export type AccountFilter = PlatformId | "all";
export type DateRangeKey = "7d" | "30d" | "90d" | "all";
export type PostSortKey = "date" | "views" | "likes" | "comments";
export type SortDirection = "asc" | "desc";

export interface PostQuery {
  account: AccountFilter;
  range: DateRangeKey;
  sort: PostSortKey;
  dir: SortDirection;
}

export const DEFAULT_QUERY: PostQuery = {
  account: "all",
  range: "all",
  sort: "date",
  dir: "desc",
};

interface Option<T> {
  value: T;
  label: string;
}

/** Derived from PLATFORMS so there is never a second list to keep in sync. */
export const ACCOUNT_OPTIONS: Option<AccountFilter>[] = [
  { value: "all", label: "All accounts" },
  ...(Object.keys(PLATFORMS) as PlatformId[]).map((id) => ({
    value: id as AccountFilter,
    label: PLATFORMS[id].label,
  })),
];

export const RANGE_OPTIONS: Option<DateRangeKey>[] = [
  { value: "all", label: "All time" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

export const SORT_OPTIONS: Option<PostSortKey>[] = [
  { value: "date", label: "Date" },
  { value: "views", label: "Views" },
  { value: "likes", label: "Likes" },
  { value: "comments", label: "Comments" },
];

const RANGE_DAYS: Record<Exclude<DateRangeKey, "all">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

/** searchParams values may be arrays; take the first entry. */
function firstValue(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

function pick<T extends string>(
  raw: string | string[] | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  const value = firstValue(raw);
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Normalizes a raw searchParams object into a PostQuery. Unknown or malformed
 * values fall back to the default rather than throwing or emptying the list -
 * the query string is user-editable, so it cannot be trusted.
 */
export function parsePostQuery(
  raw: Record<string, string | string[] | undefined>,
): PostQuery {
  return {
    account: pick(
      raw.account,
      ACCOUNT_OPTIONS.map((o) => o.value),
      DEFAULT_QUERY.account,
    ),
    range: pick(
      raw.range,
      RANGE_OPTIONS.map((o) => o.value),
      DEFAULT_QUERY.range,
    ),
    sort: pick(
      raw.sort,
      SORT_OPTIONS.map((o) => o.value),
      DEFAULT_QUERY.sort,
    ),
    dir: pick(raw.dir, ["asc", "desc"] as const, DEFAULT_QUERY.dir),
  };
}

export function isDefaultQuery(query: PostQuery): boolean {
  return (
    query.account === DEFAULT_QUERY.account &&
    query.range === DEFAULT_QUERY.range &&
    query.sort === DEFAULT_QUERY.sort &&
    query.dir === DEFAULT_QUERY.dir
  );
}

/** Builds a query string with default values omitted, so a clean state gives a clean URL. */
export function buildPostQueryString(query: PostQuery): string {
  const params = new URLSearchParams();
  if (query.account !== DEFAULT_QUERY.account)
    params.set("account", query.account);
  if (query.range !== DEFAULT_QUERY.range) params.set("range", query.range);
  if (query.sort !== DEFAULT_QUERY.sort) params.set("sort", query.sort);
  if (query.dir !== DEFAULT_QUERY.dir) params.set("dir", query.dir);
  return params.toString();
}

/** Pure: never mutates the array it is given. */
export function filterAndSortPosts(posts: Post[], query: PostQuery): Post[] {
  let result = posts;

  if (query.account !== "all") {
    result = result.filter((post) => post.platform === query.account);
  }

  if (query.range !== "all") {
    const cutoff = Date.now() - RANGE_DAYS[query.range] * 24 * 60 * 60 * 1000;
    result = result.filter((post) => Date.parse(post.publishedAt) >= cutoff);
  }

  const compare = (a: Post, b: Post): number =>
    query.sort === "date"
      ? a.publishedAt.localeCompare(b.publishedAt)
      : a[query.sort] - b[query.sort];

  return [...result].sort((a, b) =>
    query.dir === "asc" ? compare(a, b) : compare(b, a),
  );
}
