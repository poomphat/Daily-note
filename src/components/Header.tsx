import { useRef } from "react";
import {
  addDays,
  formatCompact,
  formatFull,
  isFuture,
  isToday,
  relativeLabel,
  todayKey,
} from "../lib/date";
import type { DayNote, NotesStore } from "../lib/types";
import type { SaveState } from "../hooks/useNotes";
import { ChevronLeft, ChevronRight, Menu, Search } from "./icons";
import Tabs, { type TabId } from "./Tabs";
import ToolsMenu from "./ToolsMenu";
import EnergyGauge from "./EnergyGauge";

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
  onOpenEra: () => void;
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
  onOpenEra,
  reminderOn,
  onImport,
  onMessage,
}: Props) {
  const dateInput = useRef<HTMLInputElement>(null);
  const rel = relativeLabel(activeDate);
  const canGoNext = !isFuture(addDays(activeDate, 1));

  const openPicker = () => dateInput.current?.showPicker?.();

  return (
    <header className="sticky top-0 z-30 shrink-0 overflow-visible border-b border-line/60 bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 px-4 py-2.5 sm:gap-2.5 sm:px-6 sm:py-3 lg:max-w-none lg:px-6 xl:px-8">
        {/* Top row: tabs + primary actions only */}
        <div className="flex items-center gap-2">
          <div className="lg:hidden">
            <button
              type="button"
              onClick={onOpenMenu}
              className="icon-btn shrink-0"
              aria-label="เปิดเมนูวันที่"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <div className="-mx-1 min-w-0 flex-1 overflow-x-auto px-1">
            <Tabs value={tab} onChange={setTab} />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <SaveBadge state={saveState} />
            <button
              type="button"
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
              onOpenEra={onOpenEra}
              onImport={onImport}
              onMessage={onMessage}
            />
          </div>
        </div>

        {/* Day navigation — date is primary; chevrons are one quiet cluster */}
        {tab === "day" && (
          <>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex shrink-0 items-center rounded-lg bg-surface-muted/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveDate(addDays(activeDate, -1))}
                  className="icon-btn-sm"
                  aria-label="วันก่อนหน้า"
                >
                  <ChevronLeft className="h-[1.125rem] w-[1.125rem]" />
                </button>
                <button
                  type="button"
                  onClick={() => canGoNext && setActiveDate(addDays(activeDate, 1))}
                  disabled={!canGoNext}
                  className="icon-btn-sm disabled:opacity-30"
                  aria-label="วันถัดไป"
                >
                  <ChevronRight className="h-[1.125rem] w-[1.125rem]" />
                </button>
              </div>

              <div className="relative min-w-0 flex-1">
                <button
                  type="button"
                  onClick={openPicker}
                  className="block w-full min-w-0 rounded-lg py-0.5 text-left transition hover:bg-surface-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                  aria-label={`เลือกวันที่ · ${formatFull(activeDate)}`}
                  title="เลือกวันที่"
                >
                  <h1 className="truncate font-display text-[1.0625rem] font-semibold leading-snug tracking-tight text-ink sm:text-xl">
                    <span className="sm:hidden">{formatCompact(activeDate)}</span>
                    <span className="hidden sm:inline">{formatFull(activeDate)}</span>
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
                </button>
                <input
                  ref={dateInput}
                  type="date"
                  value={activeDate}
                  max={todayKey()}
                  onChange={(e) => e.target.value && setActiveDate(e.target.value)}
                  className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
                  tabIndex={-1}
                  aria-hidden
                />
              </div>

              {!isToday(activeDate) && (
                <button
                  type="button"
                  onClick={() => setActiveDate(todayKey())}
                  className="shrink-0 px-1.5 py-1 text-sm font-medium text-brand/90 transition hover:text-brand"
                >
                  วันนี้
                </button>
              )}
            </div>

            <EnergyGauge day={day} />
          </>
        )}
      </div>
    </header>
  );
}
