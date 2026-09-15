/** Offset between Buddhist Era (พ.ศ.) and Common Era (ค.ศ.). */
export const BE_CE_OFFSET = 543;

const THAI_DIGIT_MAP: Record<string, string> = {
  "๐": "0",
  "๑": "1",
  "๒": "2",
  "๓": "3",
  "๔": "4",
  "๕": "5",
  "๖": "6",
  "๗": "7",
  "๘": "8",
  "๙": "9",
};

/** Replace Thai digits ๐-๙ with Arabic 0-9; other characters are unchanged. */
export function toArabicDigits(raw: string): string {
  return raw.replace(/[๐-๙]/g, (ch) => THAI_DIGIT_MAP[ch] ?? ch);
}

/** พ.ศ. → ค.ศ. (e.g. 2569 → 2026). */
export function buddhistToGregorian(be: number): number {
  return be - BE_CE_OFFSET;
}

/** ค.ศ. → พ.ศ. (e.g. 2026 → 2569). */
export function gregorianToBuddhist(ce: number): number {
  return ce + BE_CE_OFFSET;
}

/**
 * Trim, convert Thai digits, then parse a whole-year integer.
 * Returns null for empty or non-integer input.
 */
export function parseYearInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const arabic = toArabicDigits(trimmed);
  if (!/^-?\d+$/.test(arabic)) return null;
  const n = Number(arabic);
  if (!Number.isInteger(n) || !Number.isFinite(n)) return null;
  return n;
}

export function currentGregorianYear(now = new Date()): number {
  return now.getFullYear();
}

export function currentBuddhistYear(now = new Date()): number {
  return gregorianToBuddhist(currentGregorianYear(now));
}
