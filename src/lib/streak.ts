import { addDays, todayKey } from "./date";
import type { NotesStore } from "./types";
import { hasDayContent } from "./storage";

/** Count consecutive days with content ending at today (or yesterday if today empty). */
export function computeStreak(store: NotesStore): number {
  let streak = 0;
  let key = todayKey();

  if (!hasDayContent(store[key])) {
    key = addDays(key, -1);
  }

  while (hasDayContent(store[key])) {
    streak++;
    key = addDays(key, -1);
  }

  return streak;
}
