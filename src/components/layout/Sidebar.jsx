import {
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Plug,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/sales", label: "Sales", icon: ShoppingCart },
  { to: "/insights", label: "AI Insights", icon: Sparkles },
  { to: "/team", label: "Team", icon: Users },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ mobileOpen, setMobileOpen, user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("trackit_user");
    navigate("/login", { replace: true });
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/30 transition-opacity md:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-sidebar flex-col border-r border-border bg-card transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-6">
          <div>
            <div className="font-display text-2xl font-extrabold text-primary">TrackIt</div>
            <p className="mt-1 text-sm text-muted">Smart Sales Tracking</p>
          </div>
          <button
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted md:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-slate-600 hover:bg-slate-50 hover:text-text"
                }`
              }
              to={to}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-2 h-8 w-1 rounded-r-full bg-primary transition-transform duration-200 ${
                      isActive ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
                    }`}
                  />
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {user?.name?.slice(0, 2)?.toUpperCase() ?? "DU"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{user?.name ?? "Demo User"}</p>
                <p className="truncate text-xs text-muted">{user?.email ?? "demo@trackit.ng"}</p>
              </div>
            </div>
            <button
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-danger hover:text-red-700"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
