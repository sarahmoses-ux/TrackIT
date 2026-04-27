import { X } from "lucide-react";
import { createPortal } from "react-dom";
import Button from "./Button";

export default function Modal({ children, open, title, onClose, subtitle }) {
  if (!open) {
    return null;
  }

  const target = document.getElementById("modal-root") ?? document.body;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-6">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="modal-sheet relative z-10 flex h-screen w-screen flex-col sm:h-auto sm:max-h-[90vh] sm:max-w-2xl">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-2xl font-bold text-text">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
          </div>
          <Button className="h-10 w-10 rounded-full px-0" onClick={onClose} variant="ghost">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </div>,
    target,
  );
}
