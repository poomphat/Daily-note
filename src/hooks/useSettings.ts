import { useCallback, useEffect, useState } from "react";
import type { AppSettings, ReminderSettings } from "../lib/types";
import { loadSettings, saveSettings } from "../lib/storage";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.classList.toggle("dark", settings.darkMode);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", settings.darkMode ? "#0f1115" : "#f7f6f2");
  }, [settings]);

  const toggleDarkMode = useCallback(() => {
    setSettings((s) => ({ ...s, darkMode: !s.darkMode }));
  }, []);

  const setReminder = useCallback((patch: Partial<ReminderSettings>) => {
    setSettings((s) => ({ ...s, reminder: { ...s.reminder, ...patch } }));
  }, []);

  return { settings, toggleDarkMode, setReminder };
}
