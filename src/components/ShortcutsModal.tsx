import { useEffect } from "react";
import { X } from "./icons";

interface Props {
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: ["T"], desc: "ไปวันนี้" },
  { keys: ["←", "→"], desc: "วันก่อนหน้า / ถัดไป" },
  { keys: ["⌘", "Enter"], desc: "เพิ่มรายการปัจจุบัน" },
  { keys: ["⌘", "K"], desc: "ค้นหาทุกบันทึก" },
  { keys: ["?"], desc: "แสดงคีย์ลัดนี้" },
  { keys: ["Esc"], desc: "ยกเลิกแก้ไข / ปิดหน้าต่าง" },
];

export default function ShortcutsModal({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="animate-rise surface w-full max-w-sm rounded-2xl p-5 shadow-2xl"
        role="dialog"
        aria-label="คีย์ลัด"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">คีย์ลัด</h2>
          <button
            onClick={onClose}
            className="tap-target grid h-9 w-9 place-items-center rounded-lg text-ink-faint transition hover:bg-paper-2 hover:text-ink"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="flex flex-col gap-2.5">
          {SHORTCUTS.map((s) => (
            <li key={s.desc} className="flex items-center justify-between gap-3">
              <span className="text-base text-ink-soft">{s.desc}</span>
              <span className="flex shrink-0 gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded-md bg-paper-2 px-2 py-0.5 text-sm font-medium text-ink ring-1 ring-line"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-ink-faint">
          คีย์ลัดทำงานเมื่อไม่ได้พิมพ์ในช่องกรอกข้อมูล
        </p>
      </div>
    </div>
  );
}
