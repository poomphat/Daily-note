import type { CategoryId, Mood } from "./types";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  emoji: string;
  /** tailwind classes for the chip / tag tint */
  tint: string;
  dot: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "main",
    label: "งานหลัก",
    emoji: "🎯",
    tint: "bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-paper-2/80 dark:text-indigo-300 dark:ring-line",
    dot: "bg-indigo-500",
  },
  {
    id: "meeting",
    label: "ประชุม",
    emoji: "🗓️",
    tint: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-paper-2/80 dark:text-amber-300 dark:ring-line",
    dot: "bg-amber-500",
  },
  {
    id: "learn",
    label: "เรียน/อ่าน",
    emoji: "📚",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-paper-2/80 dark:text-emerald-300 dark:ring-line",
    dot: "bg-emerald-500",
  },
  {
    id: "other",
    label: "อื่นๆ",
    emoji: "✨",
    tint: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-paper-2/80 dark:text-rose-300 dark:ring-line",
    dot: "bg-rose-500",
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryMeta>;

export interface MoodMeta {
  id: Mood;
  label: string;
  emoji: string;
}

export const MOODS: MoodMeta[] = [
  { id: "great", label: "ดีมาก", emoji: "🤩" },
  { id: "good", label: "ดี", emoji: "🙂" },
  { id: "okay", label: "เฉยๆ", emoji: "😐" },
  { id: "tired", label: "เหนื่อย", emoji: "😮‍💨" },
  { id: "rough", label: "แย่", emoji: "😞" },
];

export const MOOD_MAP: Record<Mood, MoodMeta> = Object.fromEntries(
  MOODS.map((m) => [m.id, m]),
) as Record<Mood, MoodMeta>;
