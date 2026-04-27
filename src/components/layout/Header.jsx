import { Bell, PackageSearch } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function Header({ alertCount, leftSlot, lowStockProducts = [], title, user }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!panelRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-header items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {leftSlot}
        <div>
          <h1 className="font-display text-2xl font-bold text-text">{title}</h1>
          <p className="hidden text-sm text-muted sm:block">
            Welcome back, {user?.name?.split(" ")[0] ?? "Demo User"}.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={panelRef}>
          <button
            aria-expanded={open}
            aria-label="Notifications"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text"
            onClick={() => setOpen((value) => !value)}
            type="button"
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 ? (
              <span className="absolute right-2 top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-semibold text-white">
                {alertCount}
              </span>
            ) : null}
          </button>
          {open ? (
            <div className="absolute right-0 top-14 z-40 w-[min(24rem,calc(100vw-2rem))] animate-slide-in rounded-[24px] border border-border bg-card p-4 shadow-modal">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 className="font-display text-xl font-semibold text-text">Notifications</h3>
                  <p className="text-sm text-muted">
                    {alertCount ? `${alertCount} low-stock alerts` : "Everything looks healthy"}
                  </p>
                </div>
                {alertCount ? <Badge tone="warning">{alertCount} alerts</Badge> : null}
              </div>

              {lowStockProducts.length ? (
                <div className="mt-3 space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-amber-950">{product.name}</p>
                          <p className="mt-1 text-xs text-amber-800">{product.category}</p>
                        </div>
                        <Badge tone="danger">{product.stock} left</Badge>
                      </div>
                    </div>
                  ))}
                  <Link to="/inventory">
                    <Button className="mt-1 w-full" onClick={() => setOpen(false)} variant="outline">
                      View inventory
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-border bg-slate-50 p-5 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                    <PackageSearch className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-text">No low-stock notifications</p>
                  <p className="mt-1 text-sm text-muted">
                    Product alerts will show up here whenever stock drops below 10 units.
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div className="hidden items-center gap-3 rounded-full border border-border bg-slate-50 px-4 py-2 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {user?.name?.slice(0, 2)?.toUpperCase() ?? "DU"}
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-text">{user?.name ?? "Demo User"}</p>
            <p className="text-xs text-muted">Owner</p>
          </div>
        </div>
      </div>
    </header>
  );
}
