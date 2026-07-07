import type { DayNote } from "../lib/types";
import { CATEGORY_MAP, MOOD_MAP } from "../lib/categories";
import { formatDayNum, formatWeekday, isToday, relativeLabel } from "../lib/date";

interface Props {
  day: DayNote;
  onSelect: (d: string) => void;
}

export default function DayCard({ day, onSelect }: Props) {
  const rel = relativeLabel(day.date);
  const today = isToday(day.date);
  const done = day.entries.filter((e) => e.done).length;

  return (
    <button
      onClick={() => onSelect(day.date)}
      className="group flex w-full items-start gap-3 rounded-2xl border border-line bg-elevated/70 p-3 text-left shadow-sm ring-1 ring-black/[0.02] transition hover:-translate-y-0.5 hover:bg-elevated hover:shadow-md dark:ring-white/[0.04] sm:p-4"
    >
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl leading-none ${
          today ? "bg-brand text-white" : "bg-paper-2 text-ink-soft"
        }`}
      >
        <span className="text-[11px] font-medium opacity-80">
          {formatWeekday(day.date)}
        </span>
        <span className="font-display text-xl font-semibold">
          {formatDayNum(day.date)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">
            {rel ?? `${day.entries.length} รายการ`}
          </span>
          {day.mood && <span className="text-sm">{MOOD_MAP[day.mood].emoji}</span>}
          {day.entries.length > 0 && (
            <span className="ml-auto shrink-0 text-xs font-medium text-ink-faint">
              {done}/{day.entries.length} เสร็จ
            </span>
          )}
        </div>

        {day.entries.length > 0 ? (
          <ul className="mt-1.5 flex flex-col gap-1">
            {day.entries.slice(0, 3).map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-[13px]">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_MAP[e.category].dot}`}
                />
                <span
                  className={`truncate ${
                    e.done ? "text-ink-faint line-through" : "text-ink-soft"
                  }`}
                >
                  {e.text}
                </span>
              </li>
            ))}
            {day.entries.length > 3 && (
              <li className="pl-3.5 text-xs text-ink-faint">
                + อีก {day.entries.length - 3} รายการ
              </li>
            )}
          </ul>
        ) : (
          <p className="mt-1 line-clamp-2 text-[13px] text-ink-faint">
            {day.reflection || "—"}
          </p>
        )}
      </div>
    </button>
  );
}
