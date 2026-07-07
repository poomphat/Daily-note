export type CategoryId = "main" | "meeting" | "learn" | "other";

export interface Entry {
  id: string;
  category: CategoryId;
  text: string;
  done: boolean;
  createdAt: number;
}

export interface DayNote {
  /** date key in YYYY-MM-DD (local) */
  date: string;
  entries: Entry[];
  /** freeform reflection / summary for the day */
  reflection: string;
  mood: Mood | null;
  updatedAt: number;
  pinned?: boolean;
  /** per-habit completion for the day, keyed by habit id */
  habitLog?: Record<string, boolean>;
}

export type Mood = "great" | "good" | "okay" | "tired" | "rough";

export type NotesStore = Record<string, DayNote>;

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  createdAt: number;
  archived?: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  /** local time in "HH:mm" */
  time: string;
}

export interface AppSettings {
  darkMode: boolean;
  reminder: ReminderSettings;
}

export interface SearchHit {
  date: string;
  type: "entry" | "reflection";
  text: string;
  entryId?: string;
  category?: CategoryId;
}
