import { AlertTriangle, Info } from "lucide-react";
import clsx from "../utils/clsx";

const toneMap = {
  info: {
    icon: Info,
    shell: "border-blue-200 bg-blue-50 text-blue-900",
    iconColor: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    shell: "border-amber-200 bg-amber-50 text-amber-900",
    iconColor: "text-amber-600",
  },
};

export default function AlertBanner({ action, message, tone = "warning" }) {
  const config = toneMap[tone] ?? toneMap.warning;
  const Icon = config.icon;

  return (
    <div className={clsx("rounded-2xl border px-4 py-3", config.shell)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Icon className={clsx("mt-0.5 h-5 w-5 shrink-0", config.iconColor)} />
          <p className="text-sm font-medium">{message}</p>
        </div>
        {action}
      </div>
    </div>
  );
}
