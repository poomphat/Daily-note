import { useState } from "react";
import type { Habit, NotesStore } from "../lib/types";
import { habitStreak } from "../lib/habits";
import { Check, Plus, Trash, X } from "./icons";

interface Props {
  habits: Habit[];
  habitLog: Record<string, boolean> | undefined;
  store: NotesStore;
  onToggle: (habitId: string) => void;
  onAdd: (name: string, emoji: string) => void;
  onRemove: (id: string) => void;
}

const EMOJI_CHOICES = [
  "💪", "🏃", "📖", "🧘", "💧", "🥗", "😴", "🧹",
  "✍️", "🎯", "💊", "🌱", "☀️", "🎸", "🧠", "✅",
];

export default function HabitTracker({
  habits,
  habitLog,
  store,
  onToggle,
  onAdd,
  onRemove,
}: Props) {
  const [manage, setManage] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);

  const submitNew = () => {
    if (!name.trim()) return;
    onAdd(name, emoji);
    setName("");
    setEmoji(EMOJI_CHOICES[0]);
  };

  return (
    <div className="surface surface-ring rounded-2xl p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-base font-medium text-ink-soft">นิสัยประจำวัน</span>
        <button
          onClick={() => setManage(true)}
          className="tap-target-sm rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand transition hover:bg-brand-soft"
        >
          จัดการ
        </button>
      </div>

      {habits.length === 0 ? (
        <button
          onClick={() => setManage(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-3.5 text-base text-ink-faint transition hover:border-brand/40 hover:text-brand"
        >
          <Plus className="h-4 w-4" />
          เพิ่มนิสัยที่อยากทำทุกวัน
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {habits.map((h) => {
            const done = Boolean(habitLog?.[h.id]);
            const streak = habitStreak(store, h.id);
            return (
              <button
                key={h.id}
                onClick={() => onToggle(h.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-base font-medium ring-1 transition ${
                  done
                    ? "chip-success"
                    : "bg-paper-2/60 text-ink-soft ring-line hover:bg-elevated"
                }`}
              >
                <span className="text-base leading-none">{h.emoji}</span>
                {h.name}
                {done && <Check className="h-4 w-4" />}
                {streak > 0 && (
                  <span className="text-xs font-semibold text-warning">
                    🔥{streak}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {manage && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setManage(false)}
          />
          <div className="animate-rise surface relative w-full max-w-sm rounded-2xl p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">
                จัดการนิสัย
              </h2>
              <button
                onClick={() => setManage(false)}
                className="tap-target grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition hover:bg-elevated"
                aria-label="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {habits.length > 0 && (
              <div className="mb-4 flex flex-col gap-1.5">
                {habits.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-2 rounded-xl bg-paper-2/50 px-3 py-2.5 ring-1 ring-line"
                  >
                    <span className="text-base">{h.emoji}</span>
                    <span className="flex-1 text-base text-ink">{h.name}</span>
                    <button
                      onClick={() => onRemove(h.id)}
                      className="hover-danger tap-target grid h-9 w-9 place-items-center rounded-lg text-ink-faint transition"
                      aria-label="ลบนิสัย"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-xl border border-line p-3">
              <div className="mb-2 flex flex-wrap gap-1">
                {EMOJI_CHOICES.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`tap-target-sm grid h-9 w-9 place-items-center rounded-lg text-base transition ${
                      emoji === e
                        ? "bg-brand-soft ring-2 ring-brand/50"
                        : "hover:bg-elevated"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submitNew();
                    }
                  }}
                  placeholder="ชื่อนิสัย เช่น ออกกำลังกาย"
                  className="flex-1 rounded-xl border-0 bg-paper-2/50 px-3 py-2.5 text-base text-ink outline-none ring-1 ring-line transition placeholder:text-ink-faint focus:bg-elevated focus:ring-2 focus:ring-brand/40"
                />
                <button
                  onClick={submitNew}
                  disabled={!name.trim()}
                  className="tap-target grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand text-on-brand transition enabled:hover:bg-brand/90 disabled:opacity-40"
                  aria-label="เพิ่มนิสัย"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
