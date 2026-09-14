import type { KeyboardEvent, ReactElement, SVGProps } from "react";
import { CalendarRange, Chart, Layers, Sun } from "./icons";

export type TabId = "day" | "week" | "all" | "insights";

interface TabMeta {
  id: TabId;
  label: string;
  short: string;
  Icon: (p: SVGProps<SVGSVGElement>) => ReactElement;
}

export const TABS: TabMeta[] = [
  { id: "day", label: "วันนี้", short: "วัน", Icon: Sun },
  { id: "week", label: "สัปดาห์นี้", short: "สัปดาห์", Icon: CalendarRange },
  { id: "all", label: "ทั้งหมด", short: "ทั้งหมด", Icon: Layers },
  { id: "insights", label: "สรุป", short: "สรุป", Icon: Chart },
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
      className="inline-flex max-w-full items-center gap-0.5 rounded-lg bg-surface-muted/80 p-0.5"
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
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition sm:px-3 sm:text-base ${
              on
                ? "bg-elevated text-ink shadow-sm"
                : "text-ink-faint hover:text-ink"
            }`}
          >
            <t.Icon className="hidden h-4 w-4 shrink-0 sm:block" />
            <span className="whitespace-nowrap sm:hidden">{t.short}</span>
            <span className="hidden whitespace-nowrap sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
