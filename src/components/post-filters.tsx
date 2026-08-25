"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ACCOUNT_OPTIONS,
  buildPostQueryString,
  isDefaultQuery,
  RANGE_OPTIONS,
  SORT_OPTIONS,
  type PostQuery,
} from "@/lib/posts-query";

/**
 * Filter state lives in the URL, so this takes the parsed query as a prop
 * rather than calling useSearchParams - which would force a Suspense boundary
 * on any route that renders it.
 */
export function PostFilters({ query }: { query: PostQuery }) {
  const router = useRouter();

  function apply(patch: Partial<PostQuery>) {
    const next = { ...query, ...patch };
    const qs = buildPostQueryString(next);
    router.push(qs ? `/posts?${qs}` : "/posts");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={query.account}
        onValueChange={(value) =>
          apply({ account: value as PostQuery["account"] })
        }
      >
        <SelectTrigger className="w-[160px]" aria-label="Filter by account">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ACCOUNT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.range}
        onValueChange={(value) => apply({ range: value as PostQuery["range"] })}
      >
        <SelectTrigger className="w-[150px]" aria-label="Filter by date">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Select
          value={query.sort}
          onValueChange={(value) => apply({ sort: value as PostQuery["sort"] })}
        >
          <SelectTrigger className="w-[140px]" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                Sort by {option.label.toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          aria-label={
            query.dir === "desc"
              ? "Sorted descending, switch to ascending"
              : "Sorted ascending, switch to descending"
          }
          onClick={() => apply({ dir: query.dir === "desc" ? "asc" : "desc" })}
        >
          {query.dir === "desc" ? <ArrowDown /> : <ArrowUp />}
        </Button>
      </div>

      {!isDefaultQuery(query) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/posts")}
          className="text-muted-foreground"
        >
          <X />
          Clear
        </Button>
      )}
    </div>
  );
}
