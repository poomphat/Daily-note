import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { CategoryId } from "../lib/types";
import { CATEGORIES, CATEGORY_MAP } from "../lib/categories";
import { DAY_TEMPLATES } from "../lib/templates";
import { Copy, Plus } from "./icons";

export interface QuickAddHandle {
  submit: () => void;
  focus: () => void;
}

interface Props {
  onAdd: (category: CategoryId, text: string) => void;
  onAddMany: (items: { category: CategoryId; text: string }[]) => void;
  onCopyYesterday?: () => void;
  canCopyYesterday?: boolean;
  autoFocus?: boolean;
}

const QuickAdd = forwardRef<QuickAddHandle, Props>(function QuickAdd(
  { onAdd, onAddMany, onCopyYesterday, canCopyYesterday, autoFocus },
  ref,
) {
  const [category, setCategory] = useState<CategoryId>("main");
  const [text, setText] = useState("");
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
    <div className="rounded-2xl border border-line bg-elevated/80 p-3 shadow-sm ring-1 ring-black/[0.02] dark:ring-white/[0.04] sm:p-4">
      <div className="mb-3 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => {
          const on = c.id === category;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ${
                on
                  ? `${c.tint} scale-[1.02] shadow-sm`
                  : "bg-paper-2/60 text-ink-soft ring-line hover:bg-elevated"
              }`}
            >
              <span className="text-[15px] leading-none">{c.emoji}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-end gap-2">
        <div className="relative flex-1">
          <span
            className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${active.dot}`}
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
            placeholder={`เพิ่ม “${active.label}”… แล้วกด Enter`}
            className="w-full rounded-xl border-0 bg-paper-2/50 py-3 pl-7 pr-3 text-[15px] text-ink outline-none ring-1 ring-line transition placeholder:text-ink-faint focus:bg-elevated focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-xl bg-brand text-white shadow-sm transition enabled:hover:bg-brand/90 enabled:active:scale-95 disabled:opacity-40"
          aria-label="เพิ่มรายการ"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3">
        <span className="text-xs font-medium text-ink-faint">เทมเพลต:</span>
        {DAY_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onAddMany(t.entries)}
            className="inline-flex items-center gap-1 rounded-full bg-paper-2/80 px-2.5 py-1 text-xs font-medium text-ink-soft ring-1 ring-line transition hover:bg-elevated hover:text-ink"
          >
            <span>{t.emoji}</span>
            {t.label}
          </button>
        ))}
        {canCopyYesterday && onCopyYesterday && (
          <button
            onClick={onCopyYesterday}
            className="ml-auto inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand ring-1 ring-brand/20 transition hover:bg-brand/10"
          >
            <Copy className="h-3.5 w-3.5" />
            คัดลอกจากเมื่อวาน
          </button>
        )}
      </div>
    </div>
  );
});

export default QuickAdd;
