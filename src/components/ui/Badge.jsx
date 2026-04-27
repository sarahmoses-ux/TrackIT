import clsx from "../utils/clsx";

const tones = {
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  neutral: "bg-slate-100 text-slate-700",
  primary: "bg-primary-light text-primary",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
};

export default function Badge({ children, className, tone = "neutral" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-badge px-3 py-1 text-xs font-semibold",
        tones[tone] ?? tones.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
}
