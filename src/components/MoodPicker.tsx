import type { Mood } from "../lib/types";
import { MOODS } from "../lib/categories";

interface Props {
  mood: Mood | null;
  onChange: (m: Mood | null) => void;
}

export default function MoodPicker({ mood, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-base font-medium text-ink-soft">วันนี้เป็นยังไง?</span>
      <div className="flex gap-2">
        {MOODS.map((m) => {
          const on = mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onChange(on ? null : m.id)}
              title={m.label}
              aria-label={m.label}
              className={`tap-target grid h-11 w-11 place-items-center rounded-full text-xl transition ${
                on
                  ? "scale-110 bg-brand-soft ring-2 ring-brand/50"
                  : "opacity-60 ring-1 ring-line hover:bg-elevated hover:opacity-100"
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
