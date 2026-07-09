import { CATEGORY_MAP } from "./categories";
import type { Entry } from "./types";

export function formatEntriesForJira(entries: Entry[]): string {
  return entries
    .map((e) => `* ${CATEGORY_MAP[e.category].emoji} ${e.text.trim()}`)
    .join("\n");
}

export async function copyEntriesForJira(entries: Entry[]): Promise<boolean> {
  if (entries.length === 0) return false;
  try {
    await navigator.clipboard.writeText(formatEntriesForJira(entries));
    return true;
  } catch {
    throw new Error("ไม่สามารถคัดลอกได้ — ลองอนุญาตการเข้าถึง clipboard");
  }
}
