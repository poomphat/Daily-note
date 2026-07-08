import { useEffect, useRef, useState } from "react";
import type { DayNote, NotesStore } from "../lib/types";
import {
  exportAllJson,
  exportAllMarkdown,
  exportDayMarkdown,
  importFromJson,
  type ImportResult,
} from "../lib/export";
import { Download, Upload } from "./icons";

interface Props {
  day: DayNote;
  store: NotesStore;
  onImport: (store: NotesStore, mode: "merge" | "replace") => void;
  onMessage: (message: string) => void;
}

export default function ExportMenu({ day, store, onImport, onMessage }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<ImportResult | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

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

  const menuItem =
    "flex w-full px-3 py-2.5 text-left text-base text-ink transition hover:bg-elevated";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="tap-target grid h-11 w-11 place-items-center rounded-xl text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink"
        aria-label="นำเข้า / ส่งออกข้อมูล"
        title="นำเข้า / ส่งออก"
      >
        <Download className="h-5 w-5" />
      </button>

      {open && (
        <div className="animate-rise surface absolute right-0 top-full z-30 mt-1.5 min-w-[200px] overflow-hidden rounded-xl py-1 shadow-xl">
          <div className="px-3 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            ส่งออก
          </div>
          <button
            onClick={() => {
              exportDayMarkdown(day);
              setOpen(false);
            }}
            className={menuItem}
          >
            วันนี้ (.md)
          </button>
          <button
            onClick={() => {
              exportAllMarkdown(store);
              setOpen(false);
            }}
            className={menuItem}
          >
            ทั้งหมด (.md)
          </button>
          <button
            onClick={() => {
              exportAllJson(store);
              setOpen(false);
            }}
            className={menuItem}
          >
            ทั้งหมด (.json) — ใช้สำรอง
          </button>

          <div className="my-1 border-t border-line/70" />
          <div className="px-3 pb-1 pt-0.5 text-xs font-semibold uppercase tracking-wide text-ink-faint">
            นำเข้า
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className={`${menuItem} items-center gap-2`}
          >
            <Upload className="h-4 w-4 text-ink-soft" />
            เลือกไฟล์ .json
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

      {pending && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setPending(null)}
          />
          <div className="animate-rise surface relative w-full max-w-sm rounded-2xl p-5 shadow-2xl">
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
        </div>
      )}
    </div>
  );
}
