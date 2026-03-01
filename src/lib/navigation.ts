import {
  LayoutDashboard,
  Lock,
  ScrollText,
  Settings,
  Zap,
  Puzzle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vaults", href: "/dashboard/vaults", icon: Lock },
  { label: "Audit Log", href: "/dashboard/audit", icon: ScrollText },
  { label: "Extension Setup", href: "/dashboard/extension-setup", icon: Puzzle, badge: "NEW" },
  { label: "Pricing", href: "/dashboard/pricing", icon: Zap },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
