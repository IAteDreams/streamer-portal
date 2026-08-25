"use client";

import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Streamer } from "@/lib/types";

export function UserMenu({
  streamer,
  initials,
}: {
  streamer: Streamer;
  initials: string;
}) {
  function handleLogout() {
    // Auth is out of scope for this sample, so there is no session to clear.
    // Wire this to a real sign-out when authentication is added.
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Account menu for ${streamer.displayName}`}
        className="cursor-pointer rounded-full outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <Avatar>
          <AvatarImage src={streamer.avatarUrl} alt="" />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-medium">{streamer.displayName}</span>
          <span className="text-xs font-normal text-muted-foreground">
            @{streamer.handle}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
