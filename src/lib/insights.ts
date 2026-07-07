import type { CategoryId, Mood, NotesStore } from "./types";
import { hasDayContent } from "./storage";
import { computeStreak } from "./streak";
import { addDays } from "./date";

export interface Insights {
  daysLogged: number;
  totalEntries: number;
  doneEntries: number;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  categoryCounts: Record<CategoryId, number>;
  moodCounts: Record<Mood, number>;
  moodTotal: number;
  topCategory: CategoryId | null;
}

const emptyCategoryCounts = (): Record<CategoryId, number> => ({
  main: 0,
  meeting: 0,
  learn: 0,
  other: 0,
});

const emptyMoodCounts = (): Record<Mood, number> => ({
  great: 0,
  good: 0,
  okay: 0,
  tired: 0,
  rough: 0,
});

export function computeBestStreak(store: NotesStore): number {
  const keys = Object.keys(store)
    .filter((k) => hasDayContent(store[k]))
    .sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const k of keys) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  }
  return best;
}

export function computeInsights(store: NotesStore): Insights {
  const categoryCounts = emptyCategoryCounts();
  const moodCounts = emptyMoodCounts();
  let daysLogged = 0;
  let totalEntries = 0;
  let doneEntries = 0;
  let moodTotal = 0;

  for (const day of Object.values(store)) {
    if (!hasDayContent(day)) continue;
    daysLogged++;
    for (const e of day.entries) {
      totalEntries++;
      categoryCounts[e.category]++;
      if (e.done) doneEntries++;
    }
    if (day.mood) {
      moodCounts[day.mood]++;
      moodTotal++;
    }
  }

  let topCategory: CategoryId | null = null;
  let topCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts) as [
    CategoryId,
    number,
  ][]) {
    if (count > topCount) {
      topCount = count;
      topCategory = cat;
    }
  }

  return {
    daysLogged,
    totalEntries,
    doneEntries,
    completionRate: totalEntries > 0 ? doneEntries / totalEntries : 0,
    currentStreak: computeStreak(store),
    bestStreak: computeBestStreak(store),
    categoryCounts,
    moodCounts,
    moodTotal,
    topCategory,
  };
}

export interface HeatCell {
  date: string;
  count: number;
}

/** Cells for the last `weeks` weeks, ordered oldest→newest, aligned to Monday-start columns. */
export function heatmapWeeks(store: NotesStore, weeks: number): HeatCell[][] {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Mon=0
  // Monday of the current week
  const mondayThisWeek = new Date(today);
  mondayThisWeek.setDate(today.getDate() - dow);

  const cols: HeatCell[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const colStart = new Date(mondayThisWeek);
    colStart.setDate(mondayThisWeek.getDate() - w * 7);
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(colStart);
      day.setDate(colStart.getDate() + d);
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, "0");
      const dd = String(day.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${dd}`;
      col.push({ date: key, count: store[key]?.entries.length ?? 0 });
    }
    cols.push(col);
  }
  return cols;
}
