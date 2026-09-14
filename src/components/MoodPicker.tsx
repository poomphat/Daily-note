import type { Mood } from "../lib/types";
import { MOODS } from "../lib/categories";

interface Props {
  mood: Mood | null;
  onChange: (m: Mood | null) => void;
}

export default function MoodPicker({ mood, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="section-label">อารมณ์</span>
      <div className="flex gap-1">
        {MOODS.map((m) => {
          const on = mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(on ? null : m.id)}
              title={m.label}
              aria-label={m.label}
              className={`grid h-10 w-10 place-items-center rounded-full text-lg transition ${
                on
                  ? "bg-brand-soft ring-2 ring-brand/40"
                  : "opacity-55 hover:bg-surface-muted hover:opacity-100"
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
