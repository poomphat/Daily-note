import type { DayNote } from "../lib/types";
import { formatMonth, monthKey } from "../lib/date";
import DayCard from "./DayCard";

interface Props {
  days: DayNote[];
  onSelectDay: (d: string) => void;
}

interface MonthGroup {
  key: string;
  label: string;
  days: DayNote[];
}

export default function TimelineView({ days, onSelectDay }: Props) {
  if (days.length === 0) {
    return (
      <div className="surface-muted animate-rise flex flex-col items-center justify-center rounded-2xl border-dashed px-6 py-12 text-center">
        <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-3xl">
          🗂️
        </div>
        <h3 className="font-display text-xl font-semibold text-ink">
          ยังไม่มีบันทึก
        </h3>
        <p className="mt-1 max-w-xs text-base text-ink-faint">
          เริ่มบันทึกกิจกรรมในแท็บ “วันนี้” แล้วบันทึกทั้งหมดจะมารวมกันที่นี่
        </p>
      </div>
    );
  }

  // `days` is already sorted newest-first; bucket contiguous runs by month.
  const groups: MonthGroup[] = [];
  for (const d of days) {
    const mk = monthKey(d.date);
    const last = groups[groups.length - 1];
    if (!last || last.key !== mk) {
      groups.push({ key: mk, label: formatMonth(d.date), days: [d] });
    } else {
      last.days.push(d);
    }
  }

  const totalEntries = days.reduce((s, d) => s + d.entries.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">ทั้งหมด</h2>
        <p className="text-sm text-ink-faint">
          บันทึก {days.length} วัน · {totalEntries} กิจกรรม
        </p>
      </div>

      {groups.map((g) => (
        <section key={g.key}>
          <div className="mb-2.5 flex items-center gap-3">
            <h3 className="shrink-0 text-sm font-semibold uppercase tracking-wide text-ink-faint">
              {g.label}
            </h3>
            <span className="shrink-0 text-sm text-ink-faint">
              · {g.days.length} วัน
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>
          <div className="flex flex-col gap-2.5">
            {g.days.map((d) => (
              <DayCard key={d.date} day={d} onSelect={onSelectDay} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
