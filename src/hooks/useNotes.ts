import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CategoryId, DayNote, Entry, Mood, NotesStore } from "../lib/types";
import { addDays, todayKey } from "../lib/date";
import { computeStreak } from "../lib/streak";
import { emptyDay, loadStore, saveStore } from "../lib/storage";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export interface SaveState {
  status: "idle" | "saving" | "saved";
  at: number;
}

function hasContent(d: DayNote): boolean {
  return d.entries.length > 0 || d.reflection.trim() !== "" || d.mood !== null;
}

function sortDays(days: DayNote[]): DayNote[] {
  const pinned = days.filter((d) => d.pinned).sort((a, b) => (a.date < b.date ? 1 : -1));
  const rest = days.filter((d) => !d.pinned).sort((a, b) => (a.date < b.date ? 1 : -1));
  return [...pinned, ...rest];
}

export function useNotes() {
  const [store, setStore] = useState<NotesStore>(() => loadStore());
  const [activeDate, setActiveDate] = useState<string>(() => todayKey());
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle", at: 0 });
  const saveTimer = useRef<number | null>(null);
  const savedTimer = useRef<number | null>(null);

  useEffect(() => {
    setSaveState({ status: "saving", at: Date.now() });
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveStore(store);
      setSaveState({ status: "saved", at: Date.now() });
      if (savedTimer.current) window.clearTimeout(savedTimer.current);
      savedTimer.current = window.setTimeout(
        () => setSaveState((s) => (s.status === "saved" ? { status: "idle", at: s.at } : s)),
        2000,
      );
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [store]);

  const day: DayNote = useMemo(
    () => store[activeDate] ?? emptyDay(activeDate),
    [store, activeDate],
  );

  const mutateDay = useCallback(
    (date: string, fn: (d: DayNote) => DayNote) => {
      setStore((prev) => {
        const current = prev[date] ?? emptyDay(date);
        const next = { ...fn(current), updatedAt: Date.now() };
        return { ...prev, [date]: next };
      });
    },
    [],
  );

  const mutateActiveDay = useCallback(
    (fn: (d: DayNote) => DayNote) => mutateDay(activeDate, fn),
    [activeDate, mutateDay],
  );

  const addEntry = useCallback(
    (category: CategoryId, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      mutateActiveDay((d) => ({
        ...d,
        entries: [
          ...d.entries,
          { id: uid(), category, text: trimmed, done: false, createdAt: Date.now() },
        ],
      }));
    },
    [mutateActiveDay],
  );

  const addEntries = useCallback(
    (items: { category: CategoryId; text: string }[]) => {
      const valid = items.map((i) => ({ ...i, text: i.text.trim() })).filter((i) => i.text);
      if (valid.length === 0) return;
      mutateActiveDay((d) => ({
        ...d,
        entries: [
          ...d.entries,
          ...valid.map((i) => ({
            id: uid(),
            category: i.category,
            text: i.text,
            done: false,
            createdAt: Date.now(),
          })),
        ],
      }));
    },
    [mutateActiveDay],
  );

  const toggleEntry = useCallback(
    (id: string) => {
      mutateActiveDay((d) => ({
        ...d,
        entries: d.entries.map((e) => (e.id === id ? { ...e, done: !e.done } : e)),
      }));
    },
    [mutateActiveDay],
  );

  const editEntry = useCallback(
    (id: string, text: string) => {
      mutateActiveDay((d) => ({
        ...d,
        entries: d.entries.map((e) => (e.id === id ? { ...e, text } : e)),
      }));
    },
    [mutateActiveDay],
  );

  const removeEntry = useCallback(
    (id: string): { entry: Entry; index: number } | null => {
      const current = store[activeDate] ?? emptyDay(activeDate);
      const index = current.entries.findIndex((e) => e.id === id);
      if (index === -1) return null;
      const entry = current.entries[index];
      mutateActiveDay((d) => ({
        ...d,
        entries: d.entries.filter((e) => e.id !== id),
      }));
      return { entry, index };
    },
    [activeDate, store, mutateActiveDay],
  );

  const restoreEntry = useCallback(
    (entry: Entry, index?: number) => {
      mutateActiveDay((d) => {
        if (d.entries.some((e) => e.id === entry.id)) return d;
        const entries = [...d.entries];
        const at = index !== undefined ? Math.min(index, entries.length) : entries.length;
        entries.splice(at, 0, entry);
        return { ...d, entries };
      });
    },
    [mutateActiveDay],
  );

  const reorderEntries = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      mutateActiveDay((d) => {
        const entries = [...d.entries];
        const [moved] = entries.splice(fromIndex, 1);
        entries.splice(toIndex, 0, moved);
        return { ...d, entries };
      });
    },
    [mutateActiveDay],
  );

  const setReflection = useCallback(
    (reflection: string) => mutateActiveDay((d) => ({ ...d, reflection })),
    [mutateActiveDay],
  );

  const setMood = useCallback(
    (mood: Mood | null) => mutateActiveDay((d) => ({ ...d, mood })),
    [mutateActiveDay],
  );

  const togglePin = useCallback(
    (date: string) => {
      mutateDay(date, (d) => ({ ...d, pinned: !d.pinned }));
    },
    [mutateDay],
  );

  const toggleHabit = useCallback(
    (habitId: string) => {
      mutateActiveDay((d) => {
        const log = { ...(d.habitLog ?? {}) };
        log[habitId] = !log[habitId];
        return { ...d, habitLog: log };
      });
    },
    [mutateActiveDay],
  );

  const copyFromYesterday = useCallback((): number => {
    const yesterday = addDays(activeDate, -1);
    const source = store[yesterday];
    if (!source || source.entries.length === 0) return 0;

    const copies = source.entries.map((e) => ({
      id: uid(),
      category: e.category,
      text: e.text,
      done: false,
      createdAt: Date.now(),
    }));

    mutateActiveDay((d) => ({
      ...d,
      entries: [...d.entries, ...copies],
    }));

    return copies.length;
  }, [activeDate, store, mutateActiveDay]);

  const mergeStore = useCallback(
    (incoming: NotesStore, mode: "merge" | "replace") => {
      setStore((prev) => {
        if (mode === "replace") return { ...incoming };
        return { ...prev, ...incoming };
      });
    },
    [],
  );

  // The most recent previous day (within 30 days) that still has unfinished
  // entries, plus how many of them are not already present in the active day.
  const carryOver = useMemo(() => {
    const current = store[activeDate] ?? emptyDay(activeDate);
    const existing = new Set(current.entries.map((e) => `${e.category}::${e.text}`));
    let key = activeDate;
    for (let i = 0; i < 30; i++) {
      key = addDays(key, -1);
      const d = store[key];
      if (d && d.entries.some((e) => !e.done)) {
        const count = d.entries.filter(
          (e) => !e.done && !existing.has(`${e.category}::${e.text}`),
        ).length;
        return { date: key, count };
      }
    }
    return { date: null as string | null, count: 0 };
  }, [activeDate, store]);

  const carryOverUnfinished = useCallback((): number => {
    const src = carryOver.date ? store[carryOver.date] : undefined;
    if (!src) return 0;
    const current = store[activeDate] ?? emptyDay(activeDate);
    const existing = new Set(current.entries.map((e) => `${e.category}::${e.text}`));
    const copies = src.entries
      .filter((e) => !e.done && !existing.has(`${e.category}::${e.text}`))
      .map((e) => ({
        id: uid(),
        category: e.category,
        text: e.text,
        done: false,
        createdAt: Date.now(),
      }));
    if (copies.length === 0) return 0;
    mutateActiveDay((d) => ({ ...d, entries: [...d.entries, ...copies] }));
    return copies.length;
  }, [carryOver.date, activeDate, store, mutateActiveDay]);

  const daysWithNotes = useMemo(() => {
    return sortDays(Object.values(store).filter(hasContent));
  }, [store]);

  const streak = useMemo(() => computeStreak(store), [store]);

  const yesterdayPreview = useMemo(() => {
    const yesterday = addDays(activeDate, -1);
    const yDay = store[yesterday];
    if (!yDay || yDay.entries.length === 0) return null;
    const last = yDay.entries[yDay.entries.length - 1];
    return last.text;
  }, [store, activeDate]);

  return {
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
  };
}
