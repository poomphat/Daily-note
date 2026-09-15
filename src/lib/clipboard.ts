import { CATEGORY_MAP } from "./categories";
import type { Entry } from "./types";

export function formatEntriesForJira(entries: Entry[]): string {
  return entries
    .map((e) => `* ${CATEGORY_MAP[e.category].emoji} ${e.text.trim()}`)
    .join("\n");
}

export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    throw new Error("ไม่สามารถคัดลอกได้ — ลองอนุญาตการเข้าถึง clipboard");
  }
}

export async function copyEntriesForJira(entries: Entry[]): Promise<boolean> {
  if (entries.length === 0) return false;
  await copyText(formatEntriesForJira(entries));
  return true;
}
