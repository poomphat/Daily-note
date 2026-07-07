import type { AppSettings, DayNote, NotesStore } from "./types";

const STORAGE_KEY = "daily-note:v1";
const SETTINGS_KEY = "daily-note:settings";

const DEFAULT_SETTINGS: AppSettings = { darkMode: false };

export function loadStore(): NotesStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NotesStore;
    if (parsed && typeof parsed === "object") return parsed;
    return {};
  } catch {
    return {};
  }
}

export function saveStore(store: NotesStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full / unavailable — ignore for this draft
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function emptyDay(date: string): DayNote {
  return {
    date,
    entries: [],
    reflection: "",
    mood: null,
    updatedAt: Date.now(),
  };
}

export function isDayEmpty(day: DayNote | undefined): boolean {
  if (!day) return true;
  return day.entries.length === 0 && day.reflection.trim() === "" && !day.mood;
}

export function hasDayContent(day: DayNote | undefined): boolean {
  if (!day) return false;
  return day.entries.length > 0 || day.reflection.trim() !== "" || day.mood !== null;
}
