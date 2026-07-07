import type { CategoryId } from "./types";

export interface DayTemplate {
  id: string;
  label: string;
  emoji: string;
  entries: { category: CategoryId; text: string }[];
}

export const DAY_TEMPLATES: DayTemplate[] = [
  {
    id: "work",
    label: "วันทำงาน",
    emoji: "💼",
    entries: [
      { category: "main", text: "งานหลักที่ต้องทำวันนี้" },
      { category: "meeting", text: "ประชุม / sync" },
      { category: "learn", text: "อ่านหรือเรียนเพิ่ม" },
    ],
  },
  {
    id: "off",
    label: "วันหยุด",
    emoji: "🌿",
    entries: [
      { category: "other", text: "พักผ่อน / ทำสิ่งที่ชอบ" },
      { category: "other", text: "ออกกำลังกายหรือเดินเล่น" },
    ],
  },
  {
    id: "study",
    label: "วันเรียน",
    emoji: "📖",
    entries: [
      { category: "learn", text: "เรียนหลัก / อ่านบทเรียน" },
      { category: "main", text: "ทำการบ้าน / โปรเจกต์" },
      { category: "other", text: "ทบทวนสรุป" },
    ],
  },
];
