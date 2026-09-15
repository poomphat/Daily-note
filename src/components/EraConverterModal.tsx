import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
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
const DIRECTIONS: Direction[] = ["be-to-ce", "ce-to-be"];

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
  const errorId = useId();
  const hintId = useId();
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

  const onDirectionKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const idx = DIRECTIONS.indexOf(direction);
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = DIRECTIONS[(idx + dir + DIRECTIONS.length) % DIRECTIONS.length];
    switchDirection(next);
  };

  const handleCopy = async () => {
    if (target === null) return;
    try {
      await copyText(String(target));
      setCopied(true);
      setCopyError(null);
    } catch (err) {
      setCopied(false);
      setCopyError(err instanceof Error ? err.message : "ไม่สามารถคัดลอกได้");
    }
  };

  const sourceEra = direction === "be-to-ce" ? "พ.ศ." : "ค.ศ.";
  const targetEra = direction === "be-to-ce" ? "ค.ศ." : "พ.ศ.";
  const sourceLabel = `ปี ${sourceEra}`;
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
        className="animate-rise surface relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2
            id={titleId}
            className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold leading-snug text-ink"
          >
            <Calendar className="h-5 w-5 shrink-0 text-brand" />
            <span>แปลง พ.ศ. / ค.ศ.</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="tap-target grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-soft transition hover:bg-elevated"
            aria-label="ปิด"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="grid grid-cols-2 gap-0.5 rounded-lg bg-surface-muted/80 p-0.5"
            role="radiogroup"
            aria-label="ทิศทางการแปลง"
            onKeyDown={onDirectionKeyDown}
          >
            {DIRECTIONS.map((id) => {
              const on = direction === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={on ? 0 : -1}
                  onClick={() => switchDirection(id)}
                  className={`min-h-9 whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium transition sm:px-3 ${
                    on
                      ? "bg-elevated text-ink shadow-sm"
                      : "text-ink-faint hover:text-ink"
                  }`}
                >
                  {id === "be-to-ce" ? "พ.ศ. → ค.ศ." : "ค.ศ. → พ.ศ."}
                </button>
              );
            })}
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium leading-relaxed text-ink-soft">
              {sourceLabel}
            </span>
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
              placeholder={defaultYear(direction)}
              className={`min-h-11 w-full rounded-xl border-0 bg-paper-2/50 px-3 py-2.5 text-base tabular-nums text-ink outline-none ring-1 placeholder:text-ink-faint focus:bg-elevated focus:ring-2 ${
                invalid
                  ? "ring-danger/40 focus:ring-danger/40"
                  : "ring-line focus:ring-brand/40"
              }`}
              aria-invalid={invalid}
              aria-describedby={invalid ? errorId : hintId}
            />
          </label>

          {isEmpty && (
            <p className="text-sm leading-relaxed text-ink-faint">กรอกปีเพื่อแปลง</p>
          )}

          {invalid && (
            <p id={errorId} className="chip-danger rounded-xl px-3 py-2.5 text-sm leading-relaxed">
              กรอกเป็นตัวเลขปีทั้งจำนวน เช่น 2569 หรือ ๒๕๖๙
            </p>
          )}

          {resultText && target !== null && parsed !== null && (
            <div aria-live="polite">
              <p className="text-sm leading-relaxed text-ink-faint">{targetEra}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <p className="min-w-0 break-all font-display text-xl font-semibold tabular-nums leading-tight tracking-tight text-ink">
                  {target}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="tap-target-sm inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-ink-soft transition hover:bg-surface-muted hover:text-ink"
                  aria-label={copied ? "คัดลอกแล้ว" : `คัดลอกปี ${targetEra} ${target}`}
                  title={`คัดลอก ${target}`}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-brand" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span className="whitespace-nowrap">
                    {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                  </span>
                </button>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                จาก {sourceEra} {parsed}
              </p>
              {showSoftWarning && (
                <p className="mt-2 text-sm leading-relaxed text-warning">
                  {nonPositiveTarget
                    ? "ปีที่แปลงได้เป็น 0 หรือติดลบ — ยังแสดงผลตามสูตร"
                    : "ปีนี้อยู่นอกช่วงที่ใช้ทั่วไป (1–9999) — ยังแสดงผลตามสูตร"}
                </p>
              )}
            </div>
          )}

          {copyError && (
            <p className="chip-danger rounded-xl px-3 py-2.5 text-sm leading-relaxed">
              {copyError}
            </p>
          )}

          <p id={hintId} className="text-xs leading-relaxed text-ink-faint">
            {hint}
          </p>
        </div>
      </div>
    </div>
  );
}
