import {
  LayoutDashboard,
  Lock,
  ScrollText,
  KeyRound,
  Settings,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Vaults", href: "/dashboard/vaults", icon: Lock },
  { label: "Audit Log", href: "/dashboard/audit", icon: ScrollText },
  { label: "API Keys", href: "/dashboard/api-keys", icon: KeyRound },
  { label: "Pricing", href: "/dashboard/pricing", icon: Zap },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
