import { addDays, todayKey } from "./date";
import type { NotesStore } from "./types";

/** Consecutive days (ending today, or yesterday if today not yet done) a habit was completed. */
export function habitStreak(store: NotesStore, habitId: string): number {
  let streak = 0;
  let key = todayKey();
  if (!store[key]?.habitLog?.[habitId]) {
    key = addDays(key, -1);
  }
  while (store[key]?.habitLog?.[habitId]) {
    streak++;
    key = addDays(key, -1);
  }
  return streak;
}

/** Total number of days a habit has been completed. */
export function habitTotal(store: NotesStore, habitId: string): number {
  return Object.values(store).filter((d) => d.habitLog?.[habitId]).length;
}

/** Completion rate over the last `days` days (0..1). */
export function habitRate(store: NotesStore, habitId: string, days = 30): number {
  let done = 0;
  let key = todayKey();
  for (let i = 0; i < days; i++) {
    if (store[key]?.habitLog?.[habitId]) done++;
    key = addDays(key, -1);
  }
  return done / days;
}
