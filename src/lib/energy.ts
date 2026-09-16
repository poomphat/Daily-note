import type { DayNote } from "./types";

export interface EnergyLevel {
  id: "empty" | "warming" | "flowing" | "full";
  label: string;
  emoji: string;
}

/** Ordered stages shown to the user as the gauge fills up. */
export const ENERGY_LEVELS: readonly EnergyLevel[] = [
  { id: "empty", label: "ว่างเปล่า", emoji: "🌑" },
  { id: "warming", label: "อุ่นเครื่อง", emoji: "🌤️" },
  { id: "flowing", label: "กำลังไปดี", emoji: "⚡" },
  { id: "full", label: "พลังเต็ม", emoji: "🌟" },
];

export interface EnergyBreakdown {
  /** Total energy for the day, 0-100. */
  score: number;
  entriesScore: number;
  reflectionScore: number;
  habitScore: number;
  moodScore: number;
  level: EnergyLevel;
}

// Entries + reflection alone can reach 90/100 — habits/mood are small bonuses
// that only push the last stretch, so "just writing a lot" is always the
// dominant way to fill the gauge.
const MAX_ENTRIES_SCORE = 55;
const MAX_REFLECTION_SCORE = 35;
const MAX_HABIT_SCORE = 7;
const MAX_MOOD_SCORE = 3;

/** Number of entries needed to max out the entries portion of the score. */
const ENTRIES_FOR_FULL_SCORE = 6;
/** Reflection length (trimmed chars) needed to max out that portion. */
const REFLECTION_CHARS_FOR_FULL_SCORE = 220;
/** Completed habits needed to max out the habit bonus. */
const HABITS_FOR_FULL_SCORE = 2;

function scaled(value: number, target: number, max: number): number {
  if (target <= 0 || value <= 0) return 0;
  return Math.round(Math.min(1, value / target) * max);
}

/** Picks the Thai stage label/emoji for a given 0-100 score. */
export function energyLevelForScore(score: number): EnergyLevel {
  if (score <= 0) return ENERGY_LEVELS[0];
  if (score < 35) return ENERGY_LEVELS[1];
  if (score < 70) return ENERGY_LEVELS[2];
  return ENERGY_LEVELS[3];
}

/**
 * Derives a 0-100 "energy" score for a day from how much the user journaled
 * that day: primarily the number of entries and the length of the free-form
 * reflection, with small bonuses for completed habits and logging a mood.
 * Pure function of `DayNote` — no storage/IO, so it's cheap to recompute on
 * every render and easy to unit test.
 */
export function computeDayEnergy(day: DayNote | undefined): EnergyBreakdown {
  const entryCount = day?.entries.length ?? 0;
  const reflectionLength = day?.reflection.trim().length ?? 0;
  // Counts habitLog truthy keys as-is (including orphaned ids after a habit
  // was deleted). Enough for a small bonus; wire activeHabitIds later if needed.
  const habitLog = day?.habitLog ?? {};
  const habitsDone = Object.values(habitLog).filter(Boolean).length;
  const hasMood = Boolean(day?.mood);

  const entriesScore = scaled(entryCount, ENTRIES_FOR_FULL_SCORE, MAX_ENTRIES_SCORE);
  const reflectionScore = scaled(
    reflectionLength,
    REFLECTION_CHARS_FOR_FULL_SCORE,
    MAX_REFLECTION_SCORE,
  );
  const habitScore = scaled(habitsDone, HABITS_FOR_FULL_SCORE, MAX_HABIT_SCORE);
  const moodScore = hasMood ? MAX_MOOD_SCORE : 0;

  const score = Math.min(100, entriesScore + reflectionScore + habitScore + moodScore);

  return {
    score,
    entriesScore,
    reflectionScore,
    habitScore,
    moodScore,
    level: energyLevelForScore(score),
  };
}
