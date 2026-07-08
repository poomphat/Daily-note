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
      className="surface surface-ring group flex w-full items-start gap-3 rounded-2xl p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
    >
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl leading-none ${
          today ? "bg-brand text-on-brand" : "bg-paper-2 text-ink-soft"
        }`}
      >
        <span className="text-xs font-medium opacity-80">
          {formatWeekday(day.date)}
        </span>
        <span className="font-display text-xl font-semibold">
          {formatDayNum(day.date)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-ink">
            {rel ?? `${day.entries.length} รายการ`}
          </span>
          {day.mood && <span className="text-base">{MOOD_MAP[day.mood].emoji}</span>}
          {day.entries.length > 0 && (
            <span className="ml-auto shrink-0 text-sm font-medium text-ink-faint">
              {done}/{day.entries.length} เสร็จ
            </span>
          )}
        </div>

        {day.entries.length > 0 ? (
          <ul className="mt-1.5 flex flex-col gap-1">
            {day.entries.slice(0, 3).map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm">
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
              <li className="pl-3.5 text-sm text-ink-faint">
                + อีก {day.entries.length - 3} รายการ
              </li>
            )}
          </ul>
        ) : (
          <p className="mt-1 line-clamp-2 text-sm text-ink-faint">
            {day.reflection || "—"}
          </p>
        )}
      </div>
    </button>
  );
}
