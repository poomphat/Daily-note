import { useMemo } from "react";
import type { Habit, NotesStore } from "../lib/types";
import { CATEGORIES, MOODS } from "../lib/categories";
import { computeInsights, heatmapWeeks } from "../lib/insights";
import { habitRate, habitStreak } from "../lib/habits";
import { formatFull, isFuture, isToday } from "../lib/date";

interface Props {
  store: NotesStore;
  habits: Habit[];
  onSelectDay: (date: string) => void;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="surface surface-ring rounded-2xl p-4 shadow-sm sm:p-5">
      <div className="text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-sm text-ink-soft">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-ink-faint">{hint}</div>}
    </div>
  );
}

function heatClass(count: number): string {
  if (count <= 0) return "bg-paper-2 ring-1 ring-line/60";
  if (count <= 2) return "bg-brand/30";
  if (count <= 4) return "bg-brand/55";
  if (count <= 6) return "bg-brand/80";
  return "bg-brand";
}

const WEEKS = 18;

export default function InsightsView({ store, habits, onSelectDay }: Props) {
  const insights = useMemo(() => computeInsights(store), [store]);
  const cols = useMemo(() => heatmapWeeks(store, WEEKS), [store]);

  if (insights.daysLogged === 0) {
    return (
      <div className="surface-muted grid place-items-center rounded-2xl border-dashed py-16 text-center">
        <div className="text-4xl">📊</div>
        <p className="mt-3 text-base text-ink-soft">ยังไม่มีข้อมูลสำหรับสรุป</p>
        <p className="mt-1 text-sm text-ink-faint">เริ่มบันทึกกิจกรรมแล้วกลับมาดูสถิติได้เลย</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="วันที่บันทึก" value={String(insights.daysLogged)} />
        <StatCard label="กิจกรรมรวม" value={String(insights.totalEntries)} />
        <StatCard
          label="ทำเสร็จแล้ว"
          value={`${Math.round(insights.completionRate * 100)}%`}
          hint={`${insights.doneEntries}/${insights.totalEntries} รายการ`}
        />
        <StatCard
          label="ต่อเนื่อง"
          value={`${insights.currentStreak} วัน`}
          hint={`สูงสุด ${insights.bestStreak} วัน`}
        />
      </div>

      {/* Activity heatmap */}
      <section className="surface surface-ring rounded-2xl p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold text-ink">ความสม่ำเสมอ</h3>
          <div className="flex items-center gap-1 text-xs text-ink-faint">
            น้อย
            <span className="h-2.5 w-2.5 rounded-sm bg-paper-2 ring-1 ring-line/60" />
            <span className="h-2.5 w-2.5 rounded-sm bg-brand/30" />
            <span className="h-2.5 w-2.5 rounded-sm bg-brand/55" />
            <span className="h-2.5 w-2.5 rounded-sm bg-brand/80" />
            <span className="h-2.5 w-2.5 rounded-sm bg-brand" />
            มาก
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {cols.map((col, i) => (
              <div key={i} className="flex flex-col gap-1">
                {col.map((cell) => {
                  const future = isFuture(cell.date);
                  return (
                    <button
                      key={cell.date}
                      disabled={future || cell.count === 0}
                      onClick={() => onSelectDay(cell.date)}
                      title={`${formatFull(cell.date)} · ${cell.count} กิจกรรม`}
                      className={`h-4 w-4 rounded-sm transition ${
                        future
                          ? "bg-transparent"
                          : `${heatClass(cell.count)} ${
                              isToday(cell.date) ? "ring-1 ring-brand" : ""
                            } ${cell.count > 0 ? "hover:scale-110" : ""}`
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category breakdown */}
      <section className="surface surface-ring rounded-2xl p-4 shadow-sm sm:p-5">
        <h3 className="mb-3 font-display text-base font-semibold text-ink">สัดส่วนหมวดหมู่</h3>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((c) => {
            const count = insights.categoryCounts[c.id];
            const pct = insights.totalEntries > 0 ? (count / insights.totalEntries) * 100 : 0;
            return (
              <div key={c.id} className="flex items-center gap-3">
                <div className="flex w-28 shrink-0 items-center gap-1.5 text-base text-ink-soft">
                  <span>{c.emoji}</span>
                  {c.label}
                </div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-2">
                  <div
                    className={`h-full rounded-full ${c.dot}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="w-14 shrink-0 text-right text-sm tabular-nums text-ink-faint">
                  {count} ({Math.round(pct)}%)
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mood distribution */}
      {insights.moodTotal > 0 && (
        <section className="surface surface-ring rounded-2xl p-4 shadow-sm sm:p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-ink">อารมณ์ที่ผ่านมา</h3>
          <div className="flex items-end justify-between gap-2">
            {MOODS.map((m) => {
              const count = insights.moodCounts[m.id];
              const pct = insights.moodTotal > 0 ? (count / insights.moodTotal) * 100 : 0;
              return (
                <div key={m.id} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-24 w-full items-end justify-center">
                    <div
                      className="w-6 rounded-t-md bg-brand/70"
                      style={{ height: `${Math.max(pct, count > 0 ? 6 : 0)}%` }}
                    />
                  </div>
                  <span className="text-lg">{m.emoji}</span>
                  <span className="text-xs text-ink-faint">{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Habit consistency */}
      {habits.length > 0 && (
        <section className="surface surface-ring rounded-2xl p-4 shadow-sm sm:p-5">
          <h3 className="mb-3 font-display text-base font-semibold text-ink">
            นิสัย (30 วันล่าสุด)
          </h3>
          <div className="flex flex-col gap-2.5">
            {habits.map((h) => {
              const rate = habitRate(store, h.id, 30) * 100;
              const streak = habitStreak(store, h.id);
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <div className="flex w-28 shrink-0 items-center gap-1.5 text-base text-ink-soft">
                    <span>{h.emoji}</span>
                    <span className="truncate">{h.name}</span>
                  </div>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-paper-2">
                    <div
                      className="h-full rounded-full bg-success"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <div className="w-16 shrink-0 text-right text-sm tabular-nums text-ink-faint">
                    {Math.round(rate)}% · 🔥{streak}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
