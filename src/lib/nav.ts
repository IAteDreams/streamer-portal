import {
  FileText,
  LayoutDashboard,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Primary navigation, rendered by the sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Posts", href: "/posts", icon: FileText },
  { label: "Wallet", href: "/wallet", icon: Wallet },
];

/** The dashboard only matches exactly; the rest match their subtree. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
