import { useEffect, useRef } from "react";
import type { ReminderSettings } from "../lib/types";

/**
 * Schedules a daily notification at the configured time, only firing when the
 * current day has not been logged yet. Client-side only (works while the tab is
 * open or the PWA is running).
 */
export function useReminder(reminder: ReminderSettings, isTodayLogged: boolean) {
  const loggedRef = useRef(isTodayLogged);

  useEffect(() => {
    loggedRef.current = isTodayLogged;
  }, [isTodayLogged]);

  useEffect(() => {
    if (!reminder.enabled) return;
    if (typeof Notification === "undefined") return;

    let timer: number;

    const schedule = () => {
      const [hh, mm] = reminder.time.split(":").map(Number);
      if (Number.isNaN(hh) || Number.isNaN(mm)) return;

      const now = new Date();
      const target = new Date();
      target.setHours(hh, mm, 0, 0);
      if (target.getTime() <= now.getTime()) {
        target.setDate(target.getDate() + 1);
      }

      const delay = target.getTime() - now.getTime();
      timer = window.setTimeout(() => {
        if (Notification.permission === "granted" && !loggedRef.current) {
          new Notification("อย่าลืมจดบันทึกวันนี้ 📝", {
            body: "มาสรุปสิ่งที่ทำวันนี้กันหน่อย",
            icon: "pwa-icon.svg",
          });
        }
        schedule();
      }, delay);
    };

    schedule();
    return () => window.clearTimeout(timer);
  }, [reminder.enabled, reminder.time]);
}
