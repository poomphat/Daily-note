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
    <div className="animate-rise surface fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-5 py-3.5 text-base shadow-2xl">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand transition hover:bg-brand/20"
        >
          {actionLabel}
        </button>
      )}
      <button
        onClick={onDismiss}
        className="tap-target grid h-9 w-9 place-items-center rounded-lg text-ink-faint transition hover:bg-surface-muted hover:text-ink"
        aria-label="ปิด"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
