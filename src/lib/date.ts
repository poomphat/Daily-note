/** Build a local YYYY-MM-DD key from a Date (timezone-safe). */
export function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD key into a local Date at midnight. */
export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, delta: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + delta);
  return toKey(d);
}

export function isToday(key: string): boolean {
  return key === todayKey();
}

export function isFuture(key: string): boolean {
  return key > todayKey();
}

/** Monday-based start of the week containing `key`. */
export function startOfWeek(key: string): string {
  const d = fromKey(key);
  const offset = (d.getDay() + 6) % 7; // days since Monday (Mon=0 … Sun=6)
  d.setDate(d.getDate() - offset);
  return toKey(d);
}

/** The 7 day keys (Mon→Sun) of the week containing `key`. */
export function weekDays(key: string): string[] {
  const start = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Month bucket key, e.g. "2026-07". */
export function monthKey(key: string): string {
  return key.slice(0, 7);
}

const fullFmt = new Intl.DateTimeFormat("th-TH", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
});

const weekdayFmt = new Intl.DateTimeFormat("th-TH", { weekday: "short" });
const dayNumFmt = new Intl.DateTimeFormat("th-TH", { day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("th-TH", {
  month: "long",
  year: "numeric",
});

/** e.g. "วันพุธที่ 8 กรกฎาคม 2569" */
export function formatFull(key: string): string {
  return fullFmt.format(fromKey(key)).replace("พ.ศ. ", "");
}

/** e.g. "8 ก.ค." */
export function formatShort(key: string): string {
  return shortFmt.format(fromKey(key));
}

export function formatWeekday(key: string): string {
  return weekdayFmt.format(fromKey(key));
}

export function formatDayNum(key: string): string {
  return dayNumFmt.format(fromKey(key));
}

/** e.g. "กรกฎาคม 2569" */
export function formatMonth(key: string): string {
  return monthFmt.format(fromKey(key)).replace("พ.ศ. ", "");
}

/** Human relative label: วันนี้ / เมื่อวาน / พรุ่งนี้ or null. */
export function relativeLabel(key: string): string | null {
  const t = todayKey();
  if (key === t) return "วันนี้";
  if (key === addDays(t, -1)) return "เมื่อวาน";
  if (key === addDays(t, 1)) return "พรุ่งนี้";
  return null;
}
