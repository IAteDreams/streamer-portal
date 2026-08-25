import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserMenu } from "@/components/user-menu";
import { getCurrentStreamer, getInitials } from "@/lib/mock/streamer";

export function Navbar() {
  const streamer = getCurrentStreamer();

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger />
      <div className="ml-auto">
        <UserMenu streamer={streamer} initials={getInitials(streamer)} />
      </div>
    </header>
  );
}
