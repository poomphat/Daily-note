import { formatFull } from "./date";
import type { NotesStore, SearchHit } from "./types";
import { hasDayContent } from "./storage";

export function searchNotes(store: NotesStore, query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const day of Object.values(store)) {
    if (!hasDayContent(day)) continue;

    for (const entry of day.entries) {
      if (entry.text.toLowerCase().includes(q)) {
        hits.push({
          date: day.date,
          type: "entry",
          text: entry.text,
          entryId: entry.id,
          category: entry.category,
        });
      }
    }

    if (day.reflection.trim().toLowerCase().includes(q)) {
      hits.push({
        date: day.date,
        type: "reflection",
        text: day.reflection.trim(),
      });
    }
  }

  hits.sort((a, b) => (a.date < b.date ? 1 : -1));
  return hits;
}

export function groupHitsByDate(hits: SearchHit[]): Map<string, SearchHit[]> {
  const map = new Map<string, SearchHit[]>();
  for (const hit of hits) {
    const list = map.get(hit.date) ?? [];
    list.push(hit);
    map.set(hit.date, list);
  }
  return map;
}

export function formatSearchDateLabel(date: string): string {
  return formatFull(date);
}
