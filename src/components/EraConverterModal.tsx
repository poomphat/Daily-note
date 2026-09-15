import { useEffect, useId, useRef, useState } from "react";
import { copyText } from "../lib/clipboard";
import {
  BE_CE_OFFSET,
  buddhistToGregorian,
  currentBuddhistYear,
  currentGregorianYear,
  gregorianToBuddhist,
  parseYearInput,
} from "../lib/era";
import { Calendar, Check, Copy, X } from "./icons";

interface Props {
  onClose: () => void;
}

type Direction = "be-to-ce" | "ce-to-be";

const YEAR_MIN = 1;
const YEAR_MAX = 9999;

function defaultYear(direction: Direction): string {
  return String(
    direction === "be-to-ce" ? currentBuddhistYear() : currentGregorianYear(),
  );
}

function convert(direction: Direction, year: number): number {
  return direction === "be-to-ce"
    ? buddhistToGregorian(year)
    : gregorianToBuddhist(year);
}

function formatResult(direction: Direction, source: number, target: number): string {
  return direction === "be-to-ce"
    ? `พ.ศ. ${source} = ค.ศ. ${target}`
    : `ค.ศ. ${source} = พ.ศ. ${target}`;
}

export default function EraConverterModal({ onClose }: Props) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [direction, setDirection] = useState<Direction>("be-to-ce");
  const [raw, setRaw] = useState(() => defaultYear("be-to-ce"));
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isEmpty = raw.trim() === "";
  const parsed = parseYearInput(raw);
  const invalid = !isEmpty && parsed === null;
  const target = parsed !== null ? convert(direction, parsed) : null;
  const resultText =
    parsed !== null && target !== null ? formatResult(direction, parsed, target) : null;

  const outOfUsualRange =
    parsed !== null && (parsed < YEAR_MIN || parsed > YEAR_MAX);
  const nonPositiveTarget = target !== null && target <= 0;
  const showSoftWarning = resultText !== null && (outOfUsualRange || nonPositiveTarget);

  const switchDirection = (next: Direction) => {
    if (next === direction) return;
    setCopied(false);
    setCopyError(null);
    if (parsed !== null) {
      setRaw(String(convert(direction, parsed)));
    } else if (isEmpty) {
      setRaw(defaultYear(next));
    }
    setDirection(next);
  };

  const handleCopy = async () => {
    if (!resultText) return;
    try {
      await copyText(resultText);
      setCopied(true);
      setCopyError(null);
    } catch (err) {
      setCopied(false);
      setCopyError(err instanceof Error ? err.message : "ไม่สามารถคัดลอกได้");
    }
  };

  const sourceLabel = direction === "be-to-ce" ? "ปี พ.ศ." : "ปี ค.ศ.";
  const hint =
    direction === "be-to-ce"
      ? `ค.ศ. = พ.ศ. − ${BE_CE_OFFSET}`
      : `พ.ศ. = ค.ศ. + ${BE_CE_OFFSET}`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="animate-rise surface relative w-full max-w-sm rounded-2xl p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id={titleId}
            className="flex items-center gap-2 font-display text-lg font-semibold text-ink"
          >
            <Calendar className="h-5 w-5 text-brand" />
            แปลง พ.ศ. / ค.ศ.
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="tap-target grid h-9 w-9 place-items-center rounded-lg text-ink-soft transition hover:bg-elevated"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="grid grid-cols-2 gap-1 rounded-xl bg-paper-2 p-1"
            role="tablist"
            aria-label="ทิศทางการแปลง"
          >
            <button
              type="button"
              role="tab"
              aria-selected={direction === "be-to-ce"}
              onClick={() => switchDirection("be-to-ce")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                direction === "be-to-ce"
                  ? "bg-elevated text-ink shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              พ.ศ. → ค.ศ.
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={direction === "ce-to-be"}
              onClick={() => switchDirection("ce-to-be")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                direction === "ce-to-be"
                  ? "bg-elevated text-ink shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              ค.ศ. → พ.ศ.
            </button>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink-soft">{sourceLabel}</span>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                setCopied(false);
                setCopyError(null);
              }}
              placeholder={sourceLabel}
              className="rounded-xl border-0 bg-paper-2/50 px-3 py-2.5 text-base text-ink outline-none ring-1 ring-line placeholder:text-ink-faint focus:bg-elevated focus:ring-2 focus:ring-brand/40"
              aria-invalid={invalid}
              aria-describedby={invalid ? "era-year-error" : "era-year-hint"}
            />
          </label>

          {isEmpty && (
            <p className="rounded-xl bg-paper-2/50 px-3 py-2.5 text-base text-ink-faint">
              กรอกปีเพื่อแปลง
            </p>
          )}

          {invalid && (
            <p id="era-year-error" className="chip-danger rounded-xl px-3 py-2.5 text-sm">
              กรอกเป็นตัวเลขปีทั้งจำนวน เช่น 2569 หรือ ๒๕๖๙
            </p>
          )}

          {resultText && target !== null && (
            <div className="rounded-xl bg-paper-2/50 px-3 py-3 ring-1 ring-line">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-lg font-semibold leading-snug text-ink">
                  {resultText}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="tap-target inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-ink-soft transition hover:bg-elevated hover:text-ink"
                  aria-label="คัดลอกผลลัพธ์"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-brand" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                </button>
              </div>
              {showSoftWarning && (
                <p className="mt-2 text-sm text-warning">
                  {nonPositiveTarget
                    ? "ปีที่แปลงได้เป็น 0 หรือติดลบ — ยังแสดงผลตามสูตร"
                    : "ปีนี้อยู่นอกช่วงที่ใช้ทั่วไป (1–9999) — ยังแสดงผลตามสูตร"}
                </p>
              )}
            </div>
          )}

          {copyError && (
            <p className="chip-danger rounded-xl px-3 py-2.5 text-sm">{copyError}</p>
          )}

          <p id="era-year-hint" className="text-xs leading-relaxed text-ink-faint">
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}
