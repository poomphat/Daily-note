import type { Mood } from "../lib/types";
import { MOODS } from "../lib/categories";

interface Props {
  mood: Mood | null;
  onChange: (m: Mood | null) => void;
}

export default function MoodPicker({ mood, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="section-label">อารมณ์</span>
      <div className="flex gap-0.5" role="group" aria-label="อารมณ์วันนี้">
        {MOODS.map((m) => {
          const on = mood === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(on ? null : m.id)}
              title={m.label}
              aria-label={m.label}
              aria-pressed={on}
              className={`grid h-9 w-9 place-items-center rounded-lg text-base transition ${
                on
                  ? "bg-brand-soft ring-1 ring-brand/35"
                  : "opacity-45 hover:bg-surface-muted/80 hover:opacity-100"
              }`}
            >
              {m.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
