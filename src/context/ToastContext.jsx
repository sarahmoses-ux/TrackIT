import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const ToastContext = createContext(null);

const toneMap = {
  success: {
    icon: CheckCircle2,
    panel: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: AlertCircle,
    panel: "border-red-200 bg-red-50 text-red-900",
    iconColor: "text-red-600",
  },
  warning: {
    icon: TriangleAlert,
    panel: "border-amber-200 bg-amber-50 text-amber-900",
    iconColor: "text-amber-600",
  },
  info: {
    icon: Info,
    panel: "border-blue-200 bg-blue-50 text-blue-900",
    iconColor: "text-blue-600",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = (message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, message, type }]);
    return id;
  };

  useEffect(() => {
    if (!toasts.length) {
      return undefined;
    }

    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 3000),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  const value = useMemo(
    () => ({
      dismissToast,
      showToast,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => {
          const tone = toneMap[toast.type] ?? toneMap.info;
          const Icon = tone.icon;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto animate-toast-in rounded-2xl border px-4 py-3 shadow-lg ${tone.panel}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone.iconColor}`} />
                <p className="flex-1 text-sm font-medium">{toast.message}</p>
                <button
                  aria-label="Dismiss notification"
                  className="text-current/70 hover:text-current"
                  onClick={() => dismissToast(toast.id)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
