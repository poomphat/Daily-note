import { useRef } from "react";
import {
  addDays,
  formatFull,
  isFuture,
  isToday,
  relativeLabel,
  todayKey,
} from "../lib/date";
import type { DayNote, NotesStore } from "../lib/types";
import type { SaveState } from "../hooks/useNotes";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Help,
  Menu,
  Moon,
  Search,
  Sun,
} from "./icons";
import ExportMenu from "./ExportMenu";
import Tabs, { type TabId } from "./Tabs";

interface Props {
  tab: TabId;
  setTab: (t: TabId) => void;
  activeDate: string;
  setActiveDate: (d: string) => void;
  saveState: SaveState;
  streak: number;
  day: DayNote;
  store: NotesStore;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}

function SaveBadge({ state }: { state: SaveState }) {
  const label =
    state.status === "saving"
      ? "กำลังบันทึก…"
      : state.status === "saved"
        ? "บันทึกแล้ว"
        : "บันทึกอัตโนมัติ";
  const dot =
    state.status === "saving"
      ? "bg-amber-400 animate-pulse"
      : state.status === "saved"
        ? "bg-emerald-500"
        : "bg-ink-faint/50";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-elevated/70 px-2.5 py-1 text-xs font-medium text-ink-soft ring-1 ring-line">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export default function Header({
  tab,
  setTab,
  activeDate,
  setActiveDate,
  saveState,
  streak,
  day,
  store,
  darkMode,
  onToggleDarkMode,
  onOpenMenu,
  onOpenSearch,
  onOpenShortcuts,
}: Props) {
  const dateInput = useRef<HTMLInputElement>(null);
  const rel = relativeLabel(activeDate);
  const canGoNext = !isFuture(addDays(activeDate, 1));

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:px-6">
        {/* Top row: navigation tabs + global actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenMenu}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink lg:hidden"
            aria-label="เปิดเมนูวันที่"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1">
            <Tabs value={tab} onChange={setTab} />
          </div>

          <div className="hidden sm:block">
            <SaveBadge state={saveState} />
          </div>

          <button
            onClick={onOpenSearch}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink"
            aria-label="ค้นหา"
            title="ค้นหา (⌘K)"
          >
            <Search className="h-5 w-5" />
          </button>

          <ExportMenu day={day} store={store} />

          <button
            onClick={onToggleDarkMode}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink"
            aria-label={darkMode ? "โหมดสว่าง" : "โหมดมืด"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            onClick={onOpenShortcuts}
            className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink sm:grid"
            aria-label="คีย์ลัด"
            title="คีย์ลัด (?)"
          >
            <Help className="h-5 w-5" />
          </button>
        </div>

        {/* Second row: day navigation (only in the day view) */}
        {tab === "day" && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveDate(addDays(activeDate, -1))}
                className="grid h-10 w-10 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink"
                aria-label="วันก่อนหน้า"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => canGoNext && setActiveDate(addDays(activeDate, 1))}
                disabled={!canGoNext}
                className="grid h-10 w-10 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition enabled:hover:bg-elevated enabled:hover:text-ink disabled:opacity-30"
                aria-label="วันถัดไป"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate font-display text-base font-semibold text-ink sm:text-lg">
                  {formatFull(activeDate)}
                </h1>
                {rel && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      isToday(activeDate)
                        ? "bg-brand text-white"
                        : "bg-brand-soft text-brand"
                    }`}
                  >
                    {rel}
                  </span>
                )}
                {streak > 0 && (
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800">
                    🔥 {streak} วันติด
                  </span>
                )}
              </div>
            </div>

            {!isToday(activeDate) && (
              <button
                onClick={() => setActiveDate(todayKey())}
                className="hidden items-center gap-1.5 rounded-xl bg-ink px-3 py-2 text-sm font-medium text-paper transition hover:bg-ink/90 sm:inline-flex dark:bg-elevated dark:text-ink dark:hover:bg-elevated/80"
              >
                <Cloud className="h-4 w-4" />
                วันนี้
              </button>
            )}

            <div className="relative shrink-0">
              <button
                onClick={() => dateInput.current?.showPicker?.()}
                className="grid h-10 w-10 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink"
                aria-label="เลือกวันที่"
              >
                <Calendar className="h-5 w-5" />
              </button>
              <input
                ref={dateInput}
                type="date"
                value={activeDate}
                max={todayKey()}
                onChange={(e) => e.target.value && setActiveDate(e.target.value)}
                className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
                tabIndex={-1}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
