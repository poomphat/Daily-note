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

function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
