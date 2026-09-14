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
  const hasHelpers =
    Boolean(carryOverCount) || Boolean(canCopyYesterday) || showTemplates;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const on = c.id === category;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                on
                  ? "bg-ink text-paper dark:bg-elevated dark:text-ink dark:ring-1 dark:ring-line"
                  : "text-ink-soft hover:bg-surface-muted hover:text-ink"
              }`}
            >
              <span className="leading-none" aria-hidden>
                {c.emoji}
              </span>
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span
            className={`pointer-events-none absolute left-3.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${active.dot}`}
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
            className="w-full rounded-xl border-0 bg-elevated py-3 pl-8 pr-3.5 text-base text-ink outline-none ring-1 ring-line/80 transition placeholder:text-ink-faint focus:ring-2 focus:ring-brand/35"
          />
        </div>
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="tap-target grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-on-brand transition enabled:hover:bg-brand/90 enabled:active:scale-[0.97] disabled:opacity-35"
          aria-label="เพิ่มรายการ"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="font-medium text-ink-faint transition hover:text-ink"
          aria-expanded={showTemplates}
        >
          {showTemplates ? "ซ่อนเทมเพลต" : "เทมเพลต"}
        </button>

        {Boolean(carryOverCount) && onCarryOver && (
          <button
            onClick={onCarryOver}
            className="inline-flex items-center gap-1 font-medium text-warning transition hover:opacity-80"
          >
            <Undo className="h-3.5 w-3.5" />
            ยกงานค้างมา ({carryOverCount})
          </button>
        )}

        {canCopyYesterday && onCopyYesterday && (
          <button
            onClick={onCopyYesterday}
            className="inline-flex items-center gap-1 font-medium text-ink-faint transition hover:text-ink"
          >
            <Copy className="h-3.5 w-3.5" />
            จากเมื่อวาน
          </button>
        )}
      </div>

      {hasHelpers && showTemplates && (
        <div className="flex flex-wrap gap-1.5">
          {DAY_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onAddMany(t.entries);
                setShowTemplates(false);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-surface-muted px-2.5 py-1.5 text-sm text-ink-soft transition hover:bg-elevated hover:text-ink"
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
