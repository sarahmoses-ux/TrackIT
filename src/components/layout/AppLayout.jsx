import { Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getProducts } from "../../services/mockApi";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";
import Sidebar from "./Sidebar";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventory",
  "/sales": "Sales Log",
  "/invoices": "Invoices & Receipts",
  "/returns": "Returns & Refunds",
  "/insights": "AI Insights",
  "/team": "Team",
  "/reports": "Reports",
  "/integrations": "Integrations",
  "/settings": "Settings",
};

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("trackit_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const syncUser = (event) => {
      if (event?.detail?.user) {
        setUser(event.detail.user);
        return;
      }

      const raw = localStorage.getItem("trackit_user");
      setUser(raw ? JSON.parse(raw) : null);
    };

    const handleStorage = (event) => {
      if (event.key === "trackit_user" || event.key === null) {
        syncUser();
      }
    };

    window.addEventListener("trackit:user-changed", syncUser);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("trackit:user-changed", syncUser);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncAlerts = async () => {
      const products = await getProducts();
      if (!mounted) {
        return;
      }

      const lowStock = products
        .filter((product) => product.stock < 10)
        .sort((left, right) => left.stock - right.stock);
      setLowStockProducts(lowStock);
      setAlertCount(lowStock.length);
    };

    syncAlerts();

    const handleDataChange = () => {
      syncAlerts();
    };

    const handleStorage = (event) => {
      if (event.key === "trackit_products" || event.key === null) {
        syncAlerts();
      }
    };

    window.addEventListener("trackit:data-changed", handleDataChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      mounted = false;
      window.removeEventListener("trackit:data-changed", handleDataChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [location.pathname]);

  const title = useMemo(
    () => pageTitles[location.pathname] ?? "TrackIt",
    [location.pathname],
  );

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} user={user} />
      <div className="min-h-screen md:pl-sidebar">
        <Header
          alertCount={alertCount}
          lowStockProducts={lowStockProducts}
          leftSlot={
            <button
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-text md:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
          }
          title={title}
          user={user}
        />
        <main className="min-h-[calc(100vh-64px)] px-4 pb-24 pt-6 sm:px-6 md:pb-8 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet context={{ user, setUser }} />
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
