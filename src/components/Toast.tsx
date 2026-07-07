import { useEffect } from "react";
import { X } from "./icons";

interface Props {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export default function Toast({
  message,
  actionLabel,
  onAction,
  onDismiss,
  durationMs = 5000,
}: Props) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(t);
  }, [onDismiss, durationMs]);

  return (
    <div className="animate-rise fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-2xl ring-1 ring-white/10">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-white/15 px-2.5 py-1 font-semibold transition hover:bg-white/25"
        >
          {actionLabel}
        </button>
      )}
      <button
        onClick={onDismiss}
        className="grid h-7 w-7 place-items-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-label="ปิด"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
