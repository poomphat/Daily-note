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
}

export type Mood = "great" | "good" | "okay" | "tired" | "rough";

export type NotesStore = Record<string, DayNote>;

export interface AppSettings {
  darkMode: boolean;
}

export interface SearchHit {
  date: string;
  type: "entry" | "reflection";
  text: string;
  entryId?: string;
  category?: CategoryId;
}
