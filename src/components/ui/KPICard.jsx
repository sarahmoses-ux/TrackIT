import { ArrowUpRight } from "lucide-react";
import clsx from "../utils/clsx";

export default function KPICard({ icon: Icon, label, trend, value, className }) {
  return (
    <div
      className={clsx(
        "panel-card rounded-3xl p-5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 font-display text-3xl font-bold text-text">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <ArrowUpRight className="h-3.5 w-3.5" />
        {trend}
      </div>
    </div>
  );
}
