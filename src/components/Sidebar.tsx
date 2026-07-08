import type { DayNote } from "../lib/types";
import { CATEGORY_MAP, MOOD_MAP } from "../lib/categories";
import {
  formatDayNum,
  formatWeekday,
  isToday,
  relativeLabel,
} from "../lib/date";
import { Star, X } from "./icons";

interface Props {
  days: DayNote[];
  activeDate: string;
  onSelect: (d: string) => void;
  onTogglePin: (d: string) => void;
  onClose?: () => void;
}

function preview(day: DayNote): string {
  if (day.entries.length > 0) return day.entries.map((e) => e.text).join(" · ");
  return day.reflection;
}

function DayItem({
  day,
  active,
  onSelect,
  onTogglePin,
}: {
  day: DayNote;
  active: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
}) {
  const rel = relativeLabel(day.date);
  const catSet = Array.from(new Set(day.entries.map((e) => e.category)));

  return (
    <div
      className={`group flex w-full items-start gap-1 rounded-xl transition ${
        active ? "bg-elevated shadow-sm ring-1 ring-line" : "hover:bg-surface-muted"
      }`}
    >
      <button onClick={onSelect} className="flex min-w-0 flex-1 items-start gap-3 px-2.5 py-2.5 text-left">
        <div
          className={`grid h-11 w-11 shrink-0 flex-col place-items-center rounded-xl leading-none ${
            active || isToday(day.date)
              ? "bg-brand text-on-brand"
              : "bg-paper-2 text-ink-soft"
          }`}
        >
          <span className="text-[10px] font-medium opacity-80">{formatWeekday(day.date)}</span>
          <span className="font-display text-base font-semibold">{formatDayNum(day.date)}</span>
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-ink">
              {rel ?? `${day.entries.length} รายการ`}
            </span>
            {day.mood && <span className="text-sm">{MOOD_MAP[day.mood].emoji}</span>}
            {day.pinned && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-faint">{preview(day) || "—"}</p>
          {catSet.length > 0 && (
            <div className="mt-1.5 flex gap-1">
              {catSet.map((c) => (
                <span key={c} className={`h-1.5 w-1.5 rounded-full ${CATEGORY_MAP[c].dot}`} />
              ))}
            </div>
          )}
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin();
        }}
        className={`mr-1 mt-2.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg transition ${
          day.pinned
            ? "text-amber-500"
            : "text-ink-faint opacity-60 hover:bg-paper-2 sm:opacity-0 sm:group-hover:opacity-100"
        }`}
        aria-label={day.pinned ? "เลิกปักหมุด" : "ปักหมุด"}
        title={day.pinned ? "เลิกปักหมุด" : "ปักหมุด"}
      >
        <Star className={`h-4 w-4 ${day.pinned ? "fill-current" : ""}`} />
      </button>
    </div>
  );
}

export default function Sidebar({ days, activeDate, onSelect, onTogglePin, onClose }: Props) {
  const pinned = days.filter((d) => d.pinned);
  const regular = days.filter((d) => !d.pinned);

  return (
    <aside className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-on-brand shadow-sm">
              📓
            </span>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">Daily Note</h2>
          </div>
          <p className="mt-1 pl-10 text-xs text-ink-faint">
            {days.length > 0 ? `บันทึกไว้ ${days.length} วัน` : "ยังไม่มีบันทึก"}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated lg:hidden"
            aria-label="ปิดเมนู"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-6">
        {days.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-ink-faint">บันทึกของคุณจะปรากฏที่นี่ ✨</p>
        ) : (
          <>
            {pinned.length > 0 && (
              <div className="mb-2">
                <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  ปักหมุด
                </div>
                <ul className="group flex flex-col gap-1">
                  {pinned.map((day) => (
                    <li key={day.date}>
                      <DayItem
                        day={day}
                        active={day.date === activeDate}
                        onSelect={() => onSelect(day.date)}
                        onTogglePin={() => onTogglePin(day.date)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              {pinned.length > 0 ? "ประวัติล่าสุด" : "ประวัติล่าสุด"}
            </div>
            <ul className="group flex flex-col gap-1">
              {regular.map((day) => (
                <li key={day.date}>
                  <DayItem
                    day={day}
                    active={day.date === activeDate}
                    onSelect={() => onSelect(day.date)}
                    onTogglePin={() => onTogglePin(day.date)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
    </aside>
  );
}
