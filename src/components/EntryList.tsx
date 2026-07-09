import { useEffect, useRef, useState, type DragEvent } from "react";
import type { Entry } from "../lib/types";
import { CATEGORY_MAP } from "../lib/categories";
import { copyEntriesForJira } from "../lib/clipboard";
import { Check, Copy, Grip, Trash } from "./icons";

interface Props {
  entries: Entry[];
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onCopied?: () => void;
  onCopyError?: (message: string) => void;
}

function EntryRow({
  entry,
  index,
  onToggle,
  onEdit,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
  dragOver,
}: {
  entry: Entry;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  dragOver: boolean;
}) {
  const cat = CATEGORY_MAP[entry.category];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(entry.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const t = draft.trim();
    if (t && t !== entry.text) onEdit(entry.id, t);
    else setDraft(entry.text);
    setEditing(false);
  };

  return (
    <li
      draggable={!editing}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
      className={`group animate-rise flex items-center gap-2.5 rounded-xl px-2.5 py-3 transition hover:bg-paper-2/50 sm:gap-3 ${
        isDragging ? "opacity-40" : ""
      } ${dragOver ? "bg-brand-soft/50 ring-1 ring-brand/30" : ""}`}
    >
      <button
        type="button"
        className="hidden shrink-0 cursor-grab text-ink-faint active:cursor-grabbing sm:grid sm:h-8 sm:w-6 sm:place-items-center"
        aria-label="ลากเพื่อจัดเรียง"
        tabIndex={-1}
      >
        <Grip className="h-4 w-4" />
      </button>

      <button
        onClick={() => onToggle(entry.id)}
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-md border transition ${
          entry.done
            ? "border-success bg-success text-on-brand"
            : "border-line bg-elevated text-transparent hover:border-brand"
        }`}
        aria-label={entry.done ? "ทำเครื่องหมายยังไม่เสร็จ" : "ทำเครื่องหมายเสร็จ"}
      >
        <Check className="h-4 w-4" />
      </button>

      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-base ring-1 ${cat.tint}`}
        title={cat.label}
      >
        {cat.emoji}
      </span>

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(entry.text);
              setEditing(false);
              inputRef.current?.blur();
            }
          }}
          className="flex-1 rounded-md bg-elevated px-2.5 py-1.5 text-base text-ink outline-none ring-2 ring-brand/40"
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          className={`flex-1 text-left text-base leading-snug transition ${
            entry.done ? "text-ink-faint line-through" : "text-ink"
          }`}
        >
          {entry.text}
        </button>
      )}

      <button
        onClick={() => onRemove(entry.id)}
        className="hover-danger tap-target grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-faint opacity-0 transition focus:opacity-100 group-hover:opacity-100"
        aria-label="ลบรายการ"
      >
        <Trash className="h-4 w-4" />
      </button>
    </li>
  );
}

export default function EntryList({
  entries,
  onToggle,
  onEdit,
  onRemove,
  onReorder,
  onCopied,
  onCopyError,
}: Props) {
  const done = entries.filter((e) => e.done).length;
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDrop = (toIndex: number) => {
    if (dragIndex !== null && dragIndex !== toIndex) {
      onReorder(dragIndex, toIndex);
    }
    setDragIndex(null);
    setOverIndex(null);
  };

  const handleCopyForJira = async () => {
    try {
      const ok = await copyEntriesForJira(entries);
      if (ok) onCopied?.();
    } catch (err) {
      onCopyError?.(
        err instanceof Error ? err.message : "ไม่สามารถคัดลอกได้",
      );
    }
  };

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2 px-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 className="text-base font-semibold text-ink-soft">กิจกรรมวันนี้</h2>
          <button
            type="button"
            onClick={handleCopyForJira}
            disabled={entries.length === 0}
            className="tap-target-sm grid h-9 w-9 shrink-0 place-items-center rounded-lg text-ink-faint transition enabled:hover:bg-elevated enabled:hover:text-brand disabled:opacity-30"
            aria-label="คัดลอกเป็น bullet สำหรับ Jira"
            title="คัดลอกเป็น bullet สำหรับ Jira"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <span className="shrink-0 text-sm font-medium text-ink-faint">
          {done}/{entries.length} เสร็จแล้ว
        </span>
      </div>
      <ul className="flex flex-col">
        {entries.map((e, i) => (
          <EntryRow
            key={e.id}
            entry={e}
            index={i}
            onToggle={onToggle}
            onEdit={onEdit}
            onRemove={onRemove}
            onDragStart={setDragIndex}
            onDragOver={(ev, idx) => {
              ev.preventDefault();
              setOverIndex(idx);
            }}
            onDrop={handleDrop}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            isDragging={dragIndex === i}
            dragOver={overIndex === i && dragIndex !== i}
          />
        ))}
      </ul>
    </div>
  );
}
