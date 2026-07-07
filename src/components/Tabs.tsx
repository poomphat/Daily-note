import type { KeyboardEvent, ReactElement, SVGProps } from "react";
import { CalendarRange, Layers, Sun } from "./icons";

export type TabId = "day" | "week" | "all";

interface TabMeta {
  id: TabId;
  label: string;
  Icon: (p: SVGProps<SVGSVGElement>) => ReactElement;
}

export const TABS: TabMeta[] = [
  { id: "day", label: "วันนี้", Icon: Sun },
  { id: "week", label: "สัปดาห์นี้", Icon: CalendarRange },
  { id: "all", label: "ทั้งหมด", Icon: Layers },
];

interface Props {
  value: TabId;
  onChange: (t: TabId) => void;
}

export default function Tabs({ value, onChange }: Props) {
  const idx = TABS.findIndex((t) => t.id === value);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (idx + dir + TABS.length) % TABS.length;
    onChange(TABS[next].id);
  };

  return (
    <div
      role="tablist"
      aria-label="เลือกมุมมอง"
      onKeyDown={onKeyDown}
      className="inline-flex items-center gap-1 rounded-xl bg-paper-2/70 p-1 ring-1 ring-line"
    >
      {TABS.map((t) => {
        const on = t.id === value;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition sm:px-3 ${
              on
                ? "bg-elevated text-ink shadow-sm ring-1 ring-line"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            <t.Icon className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
