import { useState } from "react";
import type { DayNote, NotesStore } from "../lib/types";
import { emptyDay, isDayEmpty } from "../lib/storage";
import { CATEGORY_MAP, MOOD_MAP } from "../lib/categories";
import {
  addDays,
  formatDayNum,
  formatShort,
  formatWeekday,
  isFuture,
  isToday,
  startOfWeek,
  todayKey,
  weekDays,
} from "../lib/date";
import { ChevronLeft, ChevronRight } from "./icons";

interface Props {
  store: NotesStore;
  onSelectDay: (d: string) => void;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="surface surface-ring rounded-xl px-3 py-3 text-center shadow-sm sm:px-4">
      <div className="font-display text-lg font-semibold text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-ink-faint">{label}</div>
    </div>
  );
}

function WeekCell({
  dateKey,
  day,
  onSelect,
}: {
  dateKey: string;
  day: DayNote;
  onSelect: (d: string) => void;
}) {
  const empty = isDayEmpty(day);
  const future = isFuture(dateKey);
  const today = isToday(dateKey);
  const done = day.entries.filter((e) => e.done).length;

  return (
    <button
      onClick={() => onSelect(dateKey)}
      className={`group flex h-full min-w-0 items-start gap-3 rounded-2xl border p-4 text-left transition lg:min-h-[11rem] lg:flex-col lg:gap-1.5 lg:p-2.5 xl:min-h-[12rem] ${
        empty
          ? "surface-muted border-dashed hover:bg-surface"
          : "surface surface-ring shadow-sm hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl leading-none lg:flex lg:h-auto lg:w-full lg:flex-col lg:items-start lg:gap-0 lg:rounded-lg lg:px-1.5 lg:py-1 ${
          today
            ? "bg-brand text-on-brand"
            : empty
              ? "bg-paper-2/60 text-ink-faint"
              : "bg-paper-2 text-ink-soft"
        }`}
      >
        <span className="text-xs font-medium opacity-80">
          {formatWeekday(dateKey)}
        </span>
        <span className="font-display text-lg font-semibold lg:text-base">
          {formatDayNum(dateKey)}
        </span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5 lg:w-full lg:pt-0">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <span className="min-w-0 text-base font-semibold leading-snug text-ink lg:text-xs lg:leading-tight">
            {empty ? (future ? "—" : "ว่าง") : `${day.entries.length} รายการ`}
          </span>
          {day.mood && <span className="text-base lg:text-sm">{MOOD_MAP[day.mood].emoji}</span>}
          {!empty && day.entries.length > 0 && (
            <span className="text-xs font-medium text-ink-faint">
              {done}/{day.entries.length}
            </span>
          )}
        </div>

        {!empty && day.entries.length > 0 && (
          <ul className="mt-1 flex flex-col gap-0.5">
            {day.entries.slice(0, 2).map((e) => (
              <li key={e.id} className="flex min-w-0 items-center gap-1.5 text-sm lg:text-xs">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_MAP[e.category].dot}`}
                />
                <span
                  className={`min-w-0 truncate ${
                    e.done ? "text-ink-faint line-through" : "text-ink-soft"
                  }`}
                >
                  {e.text}
                </span>
              </li>
            ))}
            {day.entries.length > 2 && (
              <li className="pl-3 text-xs text-ink-faint">
                + อีก {day.entries.length - 2}
              </li>
            )}
          </ul>
        )}

        {!empty && day.entries.length === 0 && day.reflection && (
          <p className="mt-1 line-clamp-2 text-sm text-ink-faint lg:text-xs">
            {day.reflection}
          </p>
        )}
      </div>
    </button>
  );
}

export default function WeekView({ store, onSelectDay }: Props) {
  const [anchor, setAnchor] = useState(() => startOfWeek(todayKey()));
  const days = weekDays(anchor);
  const end = days[6];
  const isThisWeek = anchor === startOfWeek(todayKey());
  const nextDisabled = isFuture(addDays(anchor, 7));

  const notes = days.map((k) => store[k] ?? emptyDay(k));
  const totalEntries = notes.reduce((s, d) => s + d.entries.length, 0);
  const doneEntries = notes.reduce(
    (s, d) => s + d.entries.filter((e) => e.done).length,
    0,
  );
  const activeDays = notes.filter((d) => !isDayEmpty(d)).length;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold text-ink">
            {isThisWeek ? "สัปดาห์นี้" : "ภาพรวมสัปดาห์"}
          </h2>
          <p className="text-sm text-ink-faint">
            {formatShort(anchor)} – {formatShort(end)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => setAnchor(addDays(anchor, -7))}
            className="tap-target grid h-11 w-11 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink"
            aria-label="สัปดาห์ก่อนหน้า"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {!isThisWeek && (
            <button
              onClick={() => setAnchor(startOfWeek(todayKey()))}
              className="rounded-xl px-3 py-2.5 text-base font-medium text-brand ring-1 ring-line transition hover:bg-elevated"
            >
              สัปดาห์นี้
            </button>
          )}
          <button
            onClick={() => !nextDisabled && setAnchor(addDays(anchor, 7))}
            disabled={nextDisabled}
            className="tap-target grid h-11 w-11 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition enabled:hover:bg-elevated enabled:hover:text-ink disabled:opacity-30"
            aria-label="สัปดาห์ถัดไป"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="วันที่บันทึก" value={`${activeDays}/7`} />
        <Stat label="กิจกรรม" value={totalEntries} />
        <Stat
          label="เสร็จแล้ว"
          value={totalEntries > 0 ? `${doneEntries}/${totalEntries}` : "—"}
        />
      </div>

      <div className="grid min-w-0 gap-3 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 xl:grid-rows-1 xl:items-stretch xl:gap-2">
        {days.map((k, i) => (
          <WeekCell key={k} dateKey={k} day={notes[i]} onSelect={onSelectDay} />
        ))}
      </div>
    </div>
  );
}
