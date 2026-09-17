import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DayNote, NotesStore } from "../lib/types";
import {
  exportAllJson,
  exportAllMarkdown,
  exportDayMarkdown,
  importFromJson,
  type ImportResult,
} from "../lib/export";
import {
  Bell,
  Calendar,
  Dino,
  Download,
  Help,
  Moon,
  MoreHorizontal,
  Sun,
  Upload,
} from "./icons";

interface Props {
  day: DayNote;
  store: NotesStore;
  darkMode: boolean;
  reminderOn: boolean;
  onToggleDarkMode: () => void;
  onOpenReminder: () => void;
  onOpenShortcuts: () => void;
  onOpenEra: () => void;
  onOpenDino: () => void;
  onImport: (store: NotesStore, mode: "merge" | "replace") => void;
  onMessage: (message: string) => void;
}

const itemClass =
  "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-base text-ink transition hover:bg-elevated";

/**
 * Single overflow menu for secondary header tools so the top bar
 * stays scannable (search + day nav) instead of a row of icon buttons.
 */
export default function ToolsMenu({
  day,
  store,
  darkMode,
  reminderOn,
  onToggleDarkMode,
  onOpenReminder,
  onOpenShortcuts,
  onOpenEra,
  onOpenDino,
  onImport,
  onMessage,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ImportResult | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!pending) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPending(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const result = await importFromJson(file);
      setPending(result);
      setOpen(false);
    } catch (err) {
      onMessage(err instanceof Error ? err.message : "นำเข้าไม่สำเร็จ");
    }
  };

  const confirmImport = (mode: "merge" | "replace") => {
    if (!pending) return;
    onImport(pending.store, mode);
    onMessage(`นำเข้า ${pending.count} วันเรียบร้อย`);
    setPending(null);
  };

  const closeAnd = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="icon-btn relative"
        aria-label={
          reminderOn ? "เครื่องมือเพิ่มเติม · แจ้งเตือนเปิดอยู่" : "เครื่องมือเพิ่มเติม"
        }
        aria-expanded={open}
        aria-haspopup="menu"
        title="เพิ่มเติม"
      >
        <MoreHorizontal className="h-5 w-5" />
        {reminderOn && (
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
        )}
      </button>

      {open && (
        <div className="animate-rise surface absolute right-0 top-full z-40 mt-1.5 max-h-[min(24rem,calc(100dvh-5rem))] w-[min(18rem,calc(100vw-2rem))] overflow-y-auto rounded-xl py-1.5 shadow-xl">
          <button
            onClick={() => closeAnd(onToggleDarkMode)}
            className={itemClass}
          >
            {darkMode ? <Sun className="h-4 w-4 text-ink-soft" /> : <Moon className="h-4 w-4 text-ink-soft" />}
            {darkMode ? "โหมดสว่าง" : "โหมดมืด"}
          </button>
          <button
            onClick={() => closeAnd(onOpenReminder)}
            className={itemClass}
          >
            <Bell className="h-4 w-4 text-ink-soft" />
            แจ้งเตือน
            {reminderOn && (
              <span className="ml-auto rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                เปิด
              </span>
            )}
          </button>
          <button
            onClick={() => closeAnd(onOpenShortcuts)}
            className={itemClass}
          >
            <Help className="h-4 w-4 text-ink-soft" />
            คีย์ลัด
            <span className="ml-auto text-sm text-ink-faint">?</span>
          </button>
          <button
            onClick={() => closeAnd(onOpenEra)}
            className={itemClass}
          >
            <Calendar className="h-4 w-4 text-ink-soft" />
            แปลง พ.ศ. / ค.ศ.
          </button>
          <button
            onClick={() => closeAnd(onOpenDino)}
            className={itemClass}
          >
            <Dino className="h-4 w-4 text-ink-soft" />
            เกมไดโนเสาร์โดด
          </button>

          <div className="my-1.5 border-t border-line/70" />
          <div className="px-3.5 pb-1 pt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            สำรองข้อมูล
          </div>
          <button
            onClick={() => {
              exportDayMarkdown(day);
              setOpen(false);
            }}
            className={itemClass}
          >
            <Download className="h-4 w-4 text-ink-soft" />
            ส่งออกวันนี้ (.md)
          </button>
          <button
            onClick={() => {
              exportAllMarkdown(store);
              setOpen(false);
            }}
            className={itemClass}
          >
            <Download className="h-4 w-4 text-ink-soft" />
            ส่งออกทั้งหมด (.md)
          </button>
          <button
            onClick={() => {
              exportAllJson(store);
              setOpen(false);
            }}
            className={itemClass}
          >
            <Download className="h-4 w-4 text-ink-soft" />
            สำรองทั้งหมด (.json)
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className={itemClass}
          >
            <Upload className="h-4 w-4 text-ink-soft" />
            นำเข้าไฟล์ .json
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="hidden"
      />

      {pending &&
        createPortal(
          <div className="fixed inset-0 z-50 grid place-items-center p-4">
            <div
              className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
              onClick={() => setPending(null)}
            />
            <div className="animate-rise surface relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl p-5 shadow-2xl">
              <h2 className="font-display text-xl font-semibold text-ink">
                นำเข้าข้อมูล
              </h2>
              <p className="mt-2 text-base text-ink-soft">
                พบ <strong className="text-ink">{pending.count}</strong> วันในไฟล์นี้
                ต้องการนำเข้าแบบไหน?
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => confirmImport("merge")}
                  className="rounded-xl bg-brand px-4 py-3 text-base font-medium text-on-brand transition hover:bg-brand/90"
                >
                  รวมกับข้อมูลเดิม (แนะนำ)
                  <span className="block text-sm font-normal text-on-brand/80">
                    วันที่ซ้ำจะถูกแทนที่ด้วยข้อมูลจากไฟล์
                  </span>
                </button>
                <button
                  onClick={() => confirmImport("replace")}
                  className="btn-danger-outline rounded-xl px-4 py-3 text-base font-medium transition"
                >
                  แทนที่ทั้งหมด
                  <span className="block text-sm font-normal opacity-80">
                    ลบข้อมูลเดิมทั้งหมดแล้วใช้ข้อมูลจากไฟล์
                  </span>
                </button>
                <button
                  onClick={() => setPending(null)}
                  className="mt-1 rounded-xl px-4 py-2.5 text-base text-ink-soft transition hover:bg-elevated"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
