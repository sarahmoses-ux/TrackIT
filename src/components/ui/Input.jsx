import clsx from "../utils/clsx";

export default function Input({ className, label, error, icon, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-text">{label}</span> : null}
      <div className="relative">
        <input
          className={clsx(
            "h-12 w-full rounded-input border bg-white px-4 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
            error ? "border-danger" : "border-border",
            icon ? "pr-12" : "",
            className,
          )}
          {...props}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}
