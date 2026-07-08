import { useState } from "react";
import type { ReminderSettings } from "../lib/types";
import { Bell, X } from "./icons";

interface Props {
  reminder: ReminderSettings;
  onChange: (patch: Partial<ReminderSettings>) => void;
  onClose: () => void;
}

const supported = typeof Notification !== "undefined";

export default function ReminderModal({ reminder, onChange, onClose }: Props) {
  const [denied, setDenied] = useState(
    supported && Notification.permission === "denied",
  );

  const toggle = async () => {
    if (reminder.enabled) {
      onChange({ enabled: false });
      return;
    }
    if (supported && Notification.permission !== "granted") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setDenied(perm === "denied");
        return;
      }
    }
    onChange({ enabled: true });
  };

  const test = () => {
    if (supported && Notification.permission === "granted") {
      new Notification("ตัวอย่างการแจ้งเตือน 🔔", {
        body: "การแจ้งเตือนจะมาแบบนี้ทุกวันตามเวลาที่ตั้งไว้",
        icon: "pwa-icon.svg",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-rise surface relative w-full max-w-sm rounded-2xl p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Bell className="h-5 w-5 text-brand" />
            แจ้งเตือนให้มาจด
          </h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-ink-soft transition hover:bg-elevated"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!supported ? (
          <p className="text-sm text-ink-soft">
            เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-ink">เปิดการแจ้งเตือน</div>
                <div className="text-xs text-ink-faint">
                  เตือนทุกวันถ้ายังไม่ได้บันทึก
                </div>
              </div>
              <button
                onClick={toggle}
                role="switch"
                aria-checked={reminder.enabled}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  reminder.enabled ? "bg-brand" : "bg-line"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-elevated shadow transition ${
                    reminder.enabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">เวลา</span>
              <input
                type="time"
                value={reminder.time}
                onChange={(e) => onChange({ time: e.target.value })}
                className="rounded-xl border-0 bg-paper-2/50 px-3 py-2 text-sm text-ink outline-none ring-1 ring-line focus:bg-elevated focus:ring-2 focus:ring-brand/40"
              />
            </label>

            {denied && (
              <p className="chip-danger rounded-xl px-3 py-2 text-xs">
                การแจ้งเตือนถูกปิดในเบราว์เซอร์ — เปิดสิทธิ์ในการตั้งค่าเว็บไซต์ก่อน
              </p>
            )}

            {reminder.enabled && Notification.permission === "granted" && (
              <button
                onClick={test}
                className="rounded-xl px-4 py-2 text-sm font-medium text-brand ring-1 ring-brand/20 transition hover:bg-brand-soft"
              >
                ทดสอบแจ้งเตือน
              </button>
            )}

            <p className="text-[11px] leading-relaxed text-ink-faint">
              หมายเหตุ: การแจ้งเตือนทำงานเมื่อเปิดหน้าเว็บไว้ หรือเมื่อติดตั้งเป็นแอป (PWA)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
