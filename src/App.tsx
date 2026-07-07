import { useCallback, useEffect, useRef, useState } from "react";
import { useNotes } from "./hooks/useNotes";
import { useSettings } from "./hooks/useSettings";
import { addDays, isFuture, isToday, todayKey } from "./lib/date";
import { isDayEmpty } from "./lib/storage";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import QuickAdd, { type QuickAddHandle } from "./components/QuickAdd";
import EntryList from "./components/EntryList";
import FreeNote from "./components/FreeNote";
import MoodPicker from "./components/MoodPicker";
import EmptyState from "./components/EmptyState";
import SearchModal from "./components/SearchModal";
import ShortcutsModal from "./components/ShortcutsModal";
import Toast from "./components/Toast";
import WeekView from "./components/WeekView";
import TimelineView from "./components/TimelineView";
import type { TabId } from "./components/Tabs";
import type { Entry } from "./lib/types";

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
    copyFromYesterday,
    daysWithNotes,
    streak,
    yesterdayPreview,
  } = useNotes();

  const { settings, toggleDarkMode } = useSettings();

  const [tab, setTab] = useState<TabId>("day");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [undo, setUndo] = useState<{ entry: Entry; index: number } | null>(null);

  const quickAddRef = useRef<QuickAddHandle>(null);

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
    setMenuOpen(false);
  };

  // Open a specific day in the day view (used by aggregated Week/All tabs).
  const openDay = useCallback((d: string) => {
    setActiveDate(d);
    setTab("day");
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  useEffect(() => {
    setCopyConfirm(false);
  }, [activeDate]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const typing = isTypingTarget(e.target);

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

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
  }, [activeDate, setActiveDate, searchOpen, shortcutsOpen, tab]);

  const showEmpty = isDayEmpty(day);
  const autoFocus = isToday(activeDate) && day.entries.length === 0;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[300px_1fr]">
      <div className="sticky top-0 hidden h-dvh border-r border-line/70 bg-paper-2/40 backdrop-blur-sm lg:block">
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

      <div className="flex min-h-dvh flex-col">
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
        />

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-6">
            <QuickAdd
              ref={quickAddRef}
              onAdd={addEntry}
              onAddMany={addEntries}
              onCopyYesterday={handleCopyYesterday}
              canCopyYesterday={yesterdayHasEntries}
              autoFocus={autoFocus}
            />

            {copyConfirm && (
              <div className="animate-rise flex items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800">
                <span>คัดลอกรายการจากเมื่อวานมาเพิ่มในวันนี้?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCopyConfirm(false)}
                    className="rounded-lg px-2.5 py-1 text-amber-800 transition hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900/50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleCopyYesterday}
                    className="rounded-lg bg-amber-600 px-2.5 py-1 font-medium text-white transition hover:bg-amber-700"
                  >
                    ยืนยัน
                  </button>
                </div>
              </div>
            )}

            {showEmpty ? (
              <EmptyState activeDate={activeDate} yesterdayPreview={yesterdayPreview} />
            ) : (
              day.entries.length > 0 && (
                <div className="rounded-2xl border border-line bg-white/60 p-2 shadow-sm ring-1 ring-black/[0.02] dark:bg-white/5 sm:p-3">
                  <EntryList
                    entries={day.entries}
                    onToggle={toggleEntry}
                    onEdit={editEntry}
                    onRemove={handleRemove}
                    onReorder={reorderEntries}
                  />
                </div>
              )
            )}

            <div className="rounded-2xl border border-line bg-white/60 p-4 shadow-sm ring-1 ring-black/[0.02] dark:bg-white/5">
              <MoodPicker mood={day.mood} onChange={setMood} />
            </div>

            <FreeNote value={day.reflection} onChange={setReflection} />
          </div>

          <footer className="mt-10 pb-6 text-center text-xs text-ink-faint">
            เก็บข้อมูลไว้ในเครื่องของคุณเท่านั้น · ร่างต้นแบบ (draft)
          </footer>
        </main>
      </div>

      {searchOpen && (
        <SearchModal
          store={store}
          onSelectDate={selectDate}
          onClose={() => setSearchOpen(false)}
        />
      )}

      {shortcutsOpen && <ShortcutsModal onClose={() => setShortcutsOpen(false)} />}

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
    </div>
  );
}
