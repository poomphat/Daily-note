import { useEffect, useRef, useState } from "react";
import type { DayNote, NotesStore } from "../lib/types";
import { exportAllJson, exportAllMarkdown, exportDayMarkdown } from "../lib/export";
import { Download } from "./icons";

interface Props {
  day: DayNote;
  store: NotesStore;
}

export default function ExportMenu({ day, store }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-10 w-10 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-white hover:text-ink"
        aria-label="ส่งออกข้อมูล"
        title="ส่งออก"
      >
        <Download className="h-5 w-5" />
      </button>
      {open && (
        <div className="animate-rise absolute right-0 top-full z-30 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-line bg-paper py-1 shadow-xl ring-1 ring-black/5">
          <button
            onClick={() => {
              exportDayMarkdown(day);
              setOpen(false);
            }}
            className="flex w-full px-3 py-2 text-left text-sm text-ink transition hover:bg-white"
          >
            วันนี้ (.md)
          </button>
          <button
            onClick={() => {
              exportAllMarkdown(store);
              setOpen(false);
            }}
            className="flex w-full px-3 py-2 text-left text-sm text-ink transition hover:bg-white"
          >
            ทั้งหมด (.md)
          </button>
          <button
            onClick={() => {
              exportAllJson(store);
              setOpen(false);
            }}
            className="flex w-full px-3 py-2 text-left text-sm text-ink transition hover:bg-white"
          >
            ทั้งหมด (.json)
          </button>
        </div>
      )}
    </div>
  );
}
