import { useCallback, useEffect, useRef, useState } from "react";
import { useNotes } from "./hooks/useNotes";
import { useSettings } from "./hooks/useSettings";
import { useHabits } from "./hooks/useHabits";
import { useReminder } from "./hooks/useReminder";
import { addDays, isFuture, isToday, todayKey } from "./lib/date";
import { hasDayContent, isDayEmpty } from "./lib/storage";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import QuickAdd, { type QuickAddHandle } from "./components/QuickAdd";
import EntryList from "./components/EntryList";
import FreeNote from "./components/FreeNote";
import MoodPicker from "./components/MoodPicker";
import HabitTracker from "./components/HabitTracker";
import EmptyState from "./components/EmptyState";
import SearchModal from "./components/SearchModal";
import ShortcutsModal from "./components/ShortcutsModal";
import ReminderModal from "./components/ReminderModal";
import EraConverterModal from "./components/EraConverterModal";
import DinoGameModal from "./components/DinoGameModal";
import Toast from "./components/Toast";
import WeekView from "./components/WeekView";
import TimelineView from "./components/TimelineView";
import InsightsView from "./components/InsightsView";
import type { TabId } from "./components/Tabs";
import type { Entry } from "./lib/types";

const FOOTER_COPY = "เก็บข้อมูลไว้ในเครื่องของคุณเท่านั้น · ร่างต้นแบบ (draft)";

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export default function App() {
  const {
    store,
    activeDate,
    setActiveDate,
    day,
    saveState,
    addEntry,
    addEntries,
    toggleEntry,
    editEntry,
    removeEntry,
    restoreEntry,
    reorderEntries,
    setReflection,
    setMood,
    togglePin,
    toggleHabit,
    copyFromYesterday,
    carryOver,
    carryOverUnfinished,
    mergeStore,
    daysWithNotes,
    streak,
    yesterdayPreview,
  } = useNotes();

  const { settings, toggleDarkMode, setReminder } = useSettings();
  const { activeHabits, addHabit, removeHabit } = useHabits();

  useReminder(settings.reminder, hasDayContent(store[todayKey()]));

  const [tab, setTab] = useState<TabId>("day");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [eraOpen, setEraOpen] = useState(false);
  const [dinoOpen, setDinoOpen] = useState(false);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [undo, setUndo] = useState<{ entry: Entry; index: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const quickAddRef = useRef<QuickAddHandle>(null);
  const mainRef = useRef<HTMLElement>(null);
  const dayPaneRef = useRef<HTMLDivElement>(null);

  const yesterdayHasEntries = Boolean(
    store[addDays(activeDate, -1)]?.entries.length,
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const selectDate = (d: string) => {
    setActiveDate(d);
    setTab("day");
    setMenuOpen(false);
  };

  // Open a specific day in the day view (used by aggregated Week/All tabs).
  const openDay = useCallback((d: string) => {
    setActiveDate(d);
    setTab("day");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    dayPaneRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [setActiveDate]);

  const handleRemove = useCallback(
    (id: string) => {
      const result = removeEntry(id);
      if (result) setUndo(result);
    },
    [removeEntry],
  );

  const handleCopyYesterday = useCallback(() => {
    if (!copyConfirm) {
      setCopyConfirm(true);
      return;
    }
    copyFromYesterday();
    setCopyConfirm(false);
  }, [copyConfirm, copyFromYesterday]);

  const handleCarryOver = useCallback(() => {
    const n = carryOverUnfinished();
    if (n > 0) setMessage(`ยกงานค้างมา ${n} รายการ`);
  }, [carryOverUnfinished]);

  useEffect(() => {
    setCopyConfirm(false);
  }, [activeDate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const typing = isTypingTarget(e.target);

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setEraOpen(false);
        setDinoOpen(false);
        setSearchOpen(true);
        return;
      }

      if (eraOpen || dinoOpen) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        quickAddRef.current?.submit();
        return;
      }

      if (typing) {
        if (e.key === "Escape" && e.target instanceof HTMLElement) {
          e.target.blur();
        }
        return;
      }

      if (searchOpen || shortcutsOpen) return;

      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setActiveDate(todayKey());
        return;
      }

      if (tab !== "day") return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveDate(addDays(activeDate, -1));
        return;
      }

      if (e.key === "ArrowRight") {
        const next = addDays(activeDate, 1);
        if (!isFuture(next)) {
          e.preventDefault();
          setActiveDate(next);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeDate, setActiveDate, searchOpen, shortcutsOpen, eraOpen, dinoOpen, tab]);

  const showEmpty = isDayEmpty(day);
  const autoFocus = isToday(activeDate) && day.entries.length === 0;

  return (
    <div className="min-h-dvh lg:grid lg:h-dvh lg:grid-cols-[minmax(15.5rem,16.75rem)_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="hidden min-h-0 border-r border-line/70 bg-paper-2/40 backdrop-blur-sm lg:block lg:h-full lg:overflow-hidden">
        <Sidebar
          days={daysWithNotes}
          activeDate={activeDate}
          onSelect={selectDate}
          onTogglePin={togglePin}
        />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="animate-rise absolute left-0 top-0 h-full w-[85%] max-w-xs border-r border-line bg-paper shadow-2xl">
            <Sidebar
              days={daysWithNotes}
              activeDate={activeDate}
              onSelect={selectDate}
              onTogglePin={togglePin}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-dvh flex-col lg:h-full lg:min-h-0 lg:overflow-hidden">
        <Header
          tab={tab}
          setTab={setTab}
          activeDate={activeDate}
          setActiveDate={setActiveDate}
          saveState={saveState}
          streak={streak}
          day={day}
          store={store}
          darkMode={settings.darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenMenu={() => setMenuOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenReminder={() => setReminderOpen(true)}
          onOpenEra={() => setEraOpen(true)}
          onOpenDino={() => setDinoOpen(true)}
          reminderOn={settings.reminder.enabled}
          onImport={mergeStore}
          onMessage={setMessage}
        />

        <main
          ref={mainRef}
          className={`mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:mx-0 lg:max-w-none lg:min-h-0 lg:px-6 lg:py-5 xl:px-8 xl:py-6 ${
            tab === "day"
              ? "lg:flex lg:flex-col lg:overflow-hidden"
              : "pane-scroll"
          }`}
        >
          {tab === "week" && (
            <WeekView store={store} onSelectDay={openDay} />
          )}

          {tab === "all" && (
            <TimelineView days={daysWithNotes} onSelectDay={openDay} />
          )}

          {tab === "insights" && (
            <InsightsView store={store} habits={activeHabits} onSelectDay={openDay} />
          )}

          {tab === "day" && (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-7 sm:gap-9 lg:grid lg:h-full lg:grid-cols-[minmax(0,1.2fr)_minmax(17.5rem,1fr)] lg:grid-rows-[minmax(0,1fr)] lg:items-stretch lg:gap-6 lg:overflow-hidden xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,26rem)] xl:gap-8">
            <div
              ref={dayPaneRef}
              className="pane-scroll flex min-h-0 min-w-0 flex-col gap-5 lg:h-full"
            >
              <section aria-label="เพิ่มกิจกรรม">
                <QuickAdd
                  ref={quickAddRef}
                  onAdd={addEntry}
                  onAddMany={addEntries}
                  onCopyYesterday={handleCopyYesterday}
                  canCopyYesterday={yesterdayHasEntries}
                  onCarryOver={handleCarryOver}
                  carryOverCount={isToday(activeDate) ? carryOver.count : 0}
                  autoFocus={autoFocus}
                />
              </section>

              {copyConfirm && (
                <div className="animate-rise flex items-center justify-between gap-3 rounded-xl bg-warning-soft/80 px-4 py-3 text-base text-warning">
                  <span>คัดลอกรายการจากเมื่อวานมาเพิ่มในวันนี้?</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCopyConfirm(false)}
                      className="rounded-lg px-2.5 py-1 transition hover:bg-warning-soft"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleCopyYesterday}
                      className="rounded-lg bg-brand px-2.5 py-1 font-medium text-on-brand transition hover:bg-brand/90"
                    >
                      ยืนยัน
                    </button>
                  </div>
                </div>
              )}

              <section aria-label="รายการวันนี้">
                {showEmpty ? (
                  <EmptyState activeDate={activeDate} yesterdayPreview={yesterdayPreview} />
                ) : (
                  day.entries.length > 0 && (
                    <EntryList
                      entries={day.entries}
                      onToggle={toggleEntry}
                      onEdit={editEntry}
                      onRemove={handleRemove}
                      onReorder={reorderEntries}
                      onCopied={() => setMessage("คัดลอก bullet สำหรับ Jira แล้ว")}
                      onCopyError={setMessage}
                    />
                  )
                )}
              </section>
            </div>

            <section
              className="pane-scroll flex min-h-0 min-w-0 flex-col gap-5 border-t border-line/50 pt-5 sm:gap-6 sm:pt-6 lg:h-full lg:gap-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0 xl:pl-7"
              aria-label="สรุปวัน"
            >
              <div className="shrink-0">
                <MoodPicker mood={day.mood} onChange={setMood} />
              </div>
              <div className="shrink-0">
                <HabitTracker
                  habits={activeHabits}
                  habitLog={day.habitLog}
                  store={store}
                  onToggle={toggleHabit}
                  onAdd={addHabit}
                  onRemove={removeHabit}
                />
              </div>
              <FreeNote fill value={day.reflection} onChange={setReflection} />
            </section>
          </div>
          )}

          <footer className="mt-8 pb-4 text-center text-sm text-ink-faint lg:hidden">
            {FOOTER_COPY}
          </footer>
        </main>

        <footer className="hidden shrink-0 border-t border-line/50 px-6 py-1.5 text-center text-xs text-ink-faint lg:block xl:px-8">
          {FOOTER_COPY}
        </footer>
      </div>

      {searchOpen && (
        <SearchModal
          store={store}
          onSelectDate={openDay}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}

      {reminderOpen && (
        <ReminderModal
          reminder={settings.reminder}
          onChange={setReminder}
          onClose={() => setReminderOpen(false)}
        />
      )}

      {eraOpen && <EraConverterModal onClose={() => setEraOpen(false)} />}

      {dinoOpen && <DinoGameModal onClose={() => setDinoOpen(false)} />}

      {undo && (
        <Toast
          message="ลบรายการแล้ว"
          actionLabel="เลิกทำ"
          onAction={() => {
            restoreEntry(undo.entry, undo.index);
            setUndo(null);
          }}
          onDismiss={() => setUndo(null)}
        />
      )}

      {message && <Toast message={message} onDismiss={() => setMessage(null)} />}
    </div>
  );
}
