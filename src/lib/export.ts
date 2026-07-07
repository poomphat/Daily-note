import { formatFull } from "./date";
import { CATEGORY_MAP, MOOD_MAP } from "./categories";
import type { DayNote, NotesStore } from "./types";
import { hasDayContent } from "./storage";

function dayToMarkdown(day: DayNote): string {
  const lines: string[] = [`# ${formatFull(day.date)}`, ""];

  if (day.mood) {
    lines.push(`**อารมณ์:** ${MOOD_MAP[day.mood].emoji} ${MOOD_MAP[day.mood].label}`, "");
  }

  if (day.entries.length > 0) {
    lines.push("## กิจกรรม", "");
    for (const e of day.entries) {
      const cat = CATEGORY_MAP[e.category];
      const check = e.done ? "x" : " ";
      lines.push(`- [${check}] ${cat.emoji} ${e.text}`);
    }
    lines.push("");
  }

  if (day.reflection.trim()) {
    lines.push("## บันทึกอิสระ", "", day.reflection.trim(), "");
  }

  return lines.join("\n");
}

export function exportDayMarkdown(day: DayNote): void {
  downloadFile(
    `daily-note-${day.date}.md`,
    dayToMarkdown(day),
    "text/markdown;charset=utf-8",
  );
}

export function exportAllMarkdown(store: NotesStore): void {
  const days = Object.values(store)
    .filter(hasDayContent)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const body = days.map(dayToMarkdown).join("\n---\n\n");
  downloadFile("daily-notes-export.md", body, "text/markdown;charset=utf-8");
}

export function exportAllJson(store: NotesStore): void {
  const days = Object.values(store)
    .filter(hasDayContent)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  downloadFile(
    "daily-notes-export.json",
    JSON.stringify(days, null, 2),
    "application/json;charset=utf-8",
  );
}

export interface ImportResult {
  store: NotesStore;
  count: number;
}

function isValidDay(d: unknown): d is DayNote {
  if (!d || typeof d !== "object") return false;
  const day = d as Record<string, unknown>;
  return (
    typeof day.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day.date) &&
    Array.isArray(day.entries)
  );
}

function normalizeDay(d: DayNote): DayNote {
  return {
    ...d,
    entries: Array.isArray(d.entries) ? d.entries : [],
    reflection: typeof d.reflection === "string" ? d.reflection : "",
    mood: d.mood ?? null,
    updatedAt: typeof d.updatedAt === "number" ? d.updatedAt : Date.now(),
  };
}

/** Parse an exported JSON file (either a DayNote[] or a NotesStore map). */
export async function importFromJson(file: File): Promise<ImportResult> {
  const text = await file.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("ไฟล์นี้ไม่ใช่ JSON ที่อ่านได้");
  }

  const days: DayNote[] = [];
  if (Array.isArray(parsed)) {
    for (const d of parsed) if (isValidDay(d)) days.push(normalizeDay(d));
  } else if (parsed && typeof parsed === "object") {
    for (const d of Object.values(parsed as Record<string, unknown>)) {
      if (isValidDay(d)) days.push(normalizeDay(d));
    }
  }

  if (days.length === 0) {
    throw new Error("ไม่พบข้อมูลบันทึกที่นำเข้าได้ในไฟล์นี้");
  }

  const store: NotesStore = {};
  for (const d of days) store[d.date] = d;
  return { store, count: days.length };
}

function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
