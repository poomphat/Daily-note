import { useCallback, useEffect, useState } from "react";
import type { AppSettings } from "../lib/types";
import { loadSettings, saveSettings } from "../lib/storage";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  useEffect(() => {
    saveSettings(settings);
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings]);

  const toggleDarkMode = useCallback(() => {
    setSettings((s) => ({ ...s, darkMode: !s.darkMode }));
  }, []);

  return { settings, toggleDarkMode };
}
