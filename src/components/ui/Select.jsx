import clsx from "../utils/clsx";

export default function Select({ children, className, error, label, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-medium text-text">{label}</span> : null}
      <select
        className={clsx(
          "h-12 w-full rounded-input border bg-white px-4 text-sm text-text outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10",
          error ? "border-danger" : "border-border",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}
