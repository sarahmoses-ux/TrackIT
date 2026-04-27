import { Loader2 } from "lucide-react";
import clsx from "../utils/clsx";

const variantClasses = {
  ghost:
    "border border-transparent bg-transparent text-text hover:bg-slate-100 hover:text-text",
  outline:
    "border border-primary/20 bg-white text-primary hover:border-primary hover:bg-primary-light",
  primary:
    "border border-primary bg-primary text-white hover:bg-primary-dark hover:border-primary-dark",
  subtle:
    "border border-border bg-white text-text hover:bg-slate-50",
  danger:
    "border border-danger bg-danger text-white hover:border-red-600 hover:bg-red-600",
};

export default function Button({
  children,
  className,
  disabled = false,
  loading = false,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  const sizeClass =
    size === "sm"
      ? "h-10 px-4 text-sm"
      : size === "lg"
        ? "h-[52px] px-6 text-base"
        : "h-11 px-5 text-sm";

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-btn font-semibold shadow-sm active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60",
        sizeClass,
        variantClasses[variant] ?? variantClasses.primary,
        className,
      )}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
