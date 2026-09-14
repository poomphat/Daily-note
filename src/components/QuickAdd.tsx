import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CategoryId } from "../lib/types";
import { CATEGORIES, CATEGORY_MAP } from "../lib/categories";
import { DAY_TEMPLATES } from "../lib/templates";
import { Copy, Plus, Undo } from "./icons";

export interface QuickAddHandle {
  submit: () => void;
  focus: () => void;
}

interface Props {
  onAdd: (category: CategoryId, text: string) => void;
  onAddMany: (items: { category: CategoryId; text: string }[]) => void;
  onCopyYesterday?: () => void;
  canCopyYesterday?: boolean;
  onCarryOver?: () => void;
  carryOverCount?: number;
  autoFocus?: boolean;
}

const QuickAdd = forwardRef<QuickAddHandle, Props>(function QuickAdd(
  {
    onAdd,
    onAddMany,
    onCopyYesterday,
    canCopyYesterday,
    onCarryOver,
    carryOverCount,
    autoFocus,
  },
  ref,
) {
  const [category, setCategory] = useState<CategoryId>("main");
  const [text, setText] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!text.trim()) return;
    onAdd(category, text);
    setText("");
  };

  useImperativeHandle(ref, () => ({
    submit,
    focus: () => inputRef.current?.focus(),
  }));

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const active = CATEGORY_MAP[category];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-1" role="group" aria-label="หมวดหมู่">
        {CATEGORIES.map((c) => {
          const on = c.id === category;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium transition sm:px-2.5 ${
                on
                  ? "bg-ink text-paper dark:bg-elevated dark:text-ink dark:ring-1 dark:ring-line"
                  : "text-ink-faint hover:bg-surface-muted/80 hover:text-ink-soft"
              }`}
              aria-label={c.label}
              title={c.label}
              aria-pressed={on}
            >
              <span className="leading-none" aria-hidden>
                {c.emoji}
              </span>
              <span className="hidden sm:inline">{c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span
            className={`pointer-events-none absolute left-3.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${active.dot}`}
            aria-hidden
          />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={`เพิ่ม${active.label}… Enter เพื่อบันทึก`}
            className="w-full rounded-xl border-0 bg-elevated py-3 pl-8 pr-3.5 text-base text-ink outline-none ring-1 ring-line/70 transition placeholder:text-ink-faint focus:ring-2 focus:ring-brand/35"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim()}
          className="tap-target grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-on-brand transition enabled:hover:bg-brand/90 enabled:active:scale-[0.97] disabled:opacity-35"
          aria-label="เพิ่มรายการ"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Secondary helpers as quiet text links — not a second button bar */}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink-faint">
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="transition hover:text-ink"
          aria-expanded={showTemplates}
        >
          {showTemplates ? "ซ่อนเทมเพลต" : "เทมเพลต"}
        </button>

        {Boolean(carryOverCount) && onCarryOver && (
          <>
            <span aria-hidden className="text-line">
              ·
            </span>
            <button
              type="button"
              onClick={onCarryOver}
              className="inline-flex items-center gap-1 text-warning transition hover:opacity-80"
            >
              <Undo className="h-3.5 w-3.5" />
              ยกงานค้างมา ({carryOverCount})
            </button>
          </>
        )}

        {canCopyYesterday && onCopyYesterday && (
          <>
            <span aria-hidden className="text-line">
              ·
            </span>
            <button
              type="button"
              onClick={onCopyYesterday}
              className="inline-flex items-center gap-1 transition hover:text-ink"
            >
              <Copy className="h-3.5 w-3.5" />
              จากเมื่อวาน
            </button>
          </>
        )}
      </div>

      {showTemplates && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {DAY_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onAddMany(t.entries);
                setShowTemplates(false);
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-ink-soft transition hover:bg-surface-muted hover:text-ink"
            >
              <span aria-hidden>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export default QuickAdd;
