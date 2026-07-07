import { useCallback, useEffect, useState } from "react";
import type { Habit } from "../lib/types";
import { loadHabits, saveHabits } from "../lib/storage";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const addHabit = useCallback((name: string, emoji: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setHabits((prev) => [
      ...prev,
      { id: uid(), name: trimmed, emoji: emoji || "✅", createdAt: Date.now() },
    ]);
  }, []);

  const updateHabit = useCallback((id: string, patch: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const activeHabits = habits.filter((h) => !h.archived);

  return { habits, activeHabits, addHabit, updateHabit, removeHabit };
}
