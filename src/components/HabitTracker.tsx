import { useState } from "react";
import { createPortal } from "react-dom";
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
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="section-label">นิสัยประจำวัน</span>
        <button
          onClick={() => setManage(true)}
          className="text-sm text-ink-faint transition hover:text-ink"
        >
          จัดการ
        </button>
      </div>

      {habits.length === 0 ? (
        <button
          onClick={() => setManage(true)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-faint transition hover:text-ink"
        >
          <Plus className="h-4 w-4" />
          เพิ่มนิสัย
        </button>
      ) : (
        <div className="flex flex-wrap gap-1">
          {habits.map((h) => {
            const done = Boolean(habitLog?.[h.id]);
            const streak = habitStreak(store, h.id);
            return (
              <button
                key={h.id}
                onClick={() => onToggle(h.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition ${
                  done
                    ? "chip-success font-medium"
                    : "text-ink-faint hover:bg-surface-muted/80 hover:text-ink-soft"
                }`}
              >
                <span className="leading-none" aria-hidden>
                  {h.emoji}
                </span>
                {h.name}
                {done && <Check className="h-3.5 w-3.5" />}
                {streak > 0 && (
                  <span className="text-xs text-warning">{streak}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {manage &&
        createPortal(
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setManage(false)}
          />
          <div className="animate-rise surface relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl p-5 shadow-2xl">
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
        </div>,
        document.body,
      )}
    </div>
  );
}
