import { UserMenu } from "@/components/user-menu";
import { getCurrentStreamer, getInitials } from "@/lib/mock/streamer";

export function Navbar() {
  const streamer = getCurrentStreamer();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
        <span className="font-semibold tracking-tight">Streamer Portal</span>
        <UserMenu streamer={streamer} initials={getInitials(streamer)} />
      </nav>
    </header>
  );
}
