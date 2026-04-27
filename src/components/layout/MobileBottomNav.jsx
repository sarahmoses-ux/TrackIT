import {
  FileText,
  LayoutDashboard,
  Package,
  Plug,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/insights", label: "Insights", icon: Sparkles },
  { to: "/team", label: "Team", icon: Users },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function MobileBottomNav() {
  return (
    <nav className="mobile-nav fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-2 py-2 backdrop-blur md:hidden">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              `flex min-w-[72px] shrink-0 flex-col items-center justify-center rounded-xl px-2 py-2 text-[11px] font-medium ${
                isActive ? "bg-primary-light text-primary" : "text-muted"
              }`
            }
            to={to}
          >
            <Icon className="mb-1 h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
