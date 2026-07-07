import { useEffect, useMemo, useRef, useState } from "react";
import type { NotesStore } from "../lib/types";
import { groupHitsByDate, searchNotes } from "../lib/search";
import { formatFull, relativeLabel } from "../lib/date";
import { CATEGORY_MAP } from "../lib/categories";
import { Search, X } from "./icons";

interface Props {
  store: NotesStore;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}

export default function SearchModal({ store, onSelectDate, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hits = useMemo(() => searchNotes(store, query), [store, query]);
  const grouped = useMemo(() => groupHitsByDate(hits), [hits]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-[12vh] backdrop-blur-sm">
      <div
        className="animate-rise w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl ring-1 ring-black/5"
        role="dialog"
        aria-label="ค้นหาบันทึก"
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหารายการหรือบันทึกอิสระ…"
            className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="hidden rounded-md bg-paper-2 px-1.5 py-0.5 text-[10px] font-medium text-ink-faint sm:inline">
            Esc
          </kbd>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint transition hover:bg-paper-2 hover:text-ink"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <p className="px-3 py-8 text-center text-sm text-ink-faint">
              พิมพ์เพื่อค้นหาทุกวัน · <kbd className="rounded bg-paper-2 px-1">⌘K</kbd>
            </p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-ink-faint">ไม่พบผลลัพธ์</p>
          ) : (
            Array.from(grouped.entries()).map(([date, dateHits]) => {
              const rel = relativeLabel(date);
              return (
                <div key={date} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-semibold text-ink-faint">
                    {rel ?? formatFull(date)}
                  </div>
                  <ul>
                    {dateHits.map((hit, i) => (
                      <li key={`${hit.type}-${hit.entryId ?? i}`}>
                        <button
                          onClick={() => {
                            onSelectDate(date);
                            onClose();
                          }}
                          className="flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition hover:bg-white"
                        >
                          {hit.type === "entry" && hit.category ? (
                            <span className="text-base leading-none">
                              {CATEGORY_MAP[hit.category].emoji}
                            </span>
                          ) : (
                            <span className="text-base leading-none">📝</span>
                          )}
                          <span className="line-clamp-2 text-sm text-ink">{hit.text}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
