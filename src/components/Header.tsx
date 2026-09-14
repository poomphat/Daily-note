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
  Menu,
  Search,
} from "./icons";
import Tabs, { type TabId } from "./Tabs";
import ToolsMenu from "./ToolsMenu";

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
  onOpenReminder: () => void;
  reminderOn: boolean;
  onImport: (store: NotesStore, mode: "merge" | "replace") => void;
  onMessage: (message: string) => void;
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
      ? "bg-warning animate-pulse"
      : state.status === "saved"
        ? "bg-success"
        : "bg-ink-faint/50";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-sm text-ink-faint"
      role="status"
      aria-live="polite"
      aria-label={label}
      title={label}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      <span className="hidden sm:inline" aria-hidden>
        {label}
      </span>
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
  onOpenReminder,
  reminderOn,
  onImport,
  onMessage,
}: Props) {
  const dateInput = useRef<HTMLInputElement>(null);
  const rel = relativeLabel(activeDate);
  const canGoNext = !isFuture(addDays(activeDate, 1));

  return (
    <header className="sticky top-0 z-20 border-b border-line/60 bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl flex-col gap-2.5 px-4 py-2.5 sm:px-6 sm:py-3">
        {/* Top row: tabs + primary actions only */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMenu}
            className="icon-btn shrink-0 lg:hidden"
            aria-label="เปิดเมนูวันที่"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1">
            <Tabs value={tab} onChange={setTab} />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <SaveBadge state={saveState} />
            <button
              onClick={onOpenSearch}
              className="icon-btn"
              aria-label="ค้นหา"
              title="ค้นหา (⌘K)"
            >
              <Search className="h-5 w-5" />
            </button>
            <ToolsMenu
              day={day}
              store={store}
              darkMode={darkMode}
              reminderOn={reminderOn}
              onToggleDarkMode={onToggleDarkMode}
              onOpenReminder={onOpenReminder}
              onOpenShortcuts={onOpenShortcuts}
              onImport={onImport}
              onMessage={onMessage}
            />
          </div>
        </div>

        {/* Day navigation — quieter, reading-first */}
        {tab === "day" && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveDate(addDays(activeDate, -1))}
              className="icon-btn"
              aria-label="วันก่อนหน้า"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => canGoNext && setActiveDate(addDays(activeDate, 1))}
              disabled={!canGoNext}
              className="icon-btn disabled:opacity-30"
              aria-label="วันถัดไป"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1 px-1">
              <h1 className="font-display text-base font-semibold leading-snug tracking-tight text-ink sm:text-xl">
                {formatFull(activeDate)}
              </h1>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                {rel && (
                  <span
                    className={`font-medium ${
                      isToday(activeDate) ? "text-brand" : "text-ink-faint"
                    }`}
                  >
                    {rel}
                  </span>
                )}
                {streak > 0 && (
                  <span className="text-ink-faint">{streak} วันติด</span>
                )}
              </div>
            </div>

            {!isToday(activeDate) && (
              <button
                onClick={() => setActiveDate(todayKey())}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand transition hover:bg-brand-soft"
              >
                วันนี้
              </button>
            )}

            <div className="relative shrink-0">
              <button
                onClick={() => dateInput.current?.showPicker?.()}
                className="icon-btn"
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
