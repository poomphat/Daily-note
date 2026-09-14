import { useEffect, useRef, useState, type DragEvent } from "react";
import type { Entry } from "../lib/types";
import { CATEGORY_MAP } from "../lib/categories";
import { copyEntriesForJira } from "../lib/clipboard";
import { Check, Grip, Trash } from "./icons";

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
      className={`group animate-rise flex items-center gap-2.5 py-3 transition sm:gap-3 ${
        isDragging ? "opacity-40" : ""
      } ${dragOver ? "bg-brand-soft/40" : ""}`}
    >
      <button
        type="button"
        className="hidden shrink-0 cursor-grab text-ink-faint/70 active:cursor-grabbing sm:grid sm:h-7 sm:w-5 sm:place-items-center"
        aria-label="ลากเพื่อจัดเรียง"
        tabIndex={-1}
      >
        <Grip className="h-4 w-4" />
      </button>

      <button
        onClick={() => onToggle(entry.id)}
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border transition ${
          entry.done
            ? "border-success bg-success text-on-brand"
            : "border-line/80 bg-transparent text-transparent hover:border-brand"
        }`}
        aria-label={entry.done ? "ทำเครื่องหมายยังไม่เสร็จ" : "ทำเครื่องหมายเสร็จ"}
      >
        <Check className="h-3.5 w-3.5" />
      </button>

      <span
        className="shrink-0 text-base leading-none"
        title={cat.label}
        aria-hidden
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
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <h2 className="section-label">กิจกรรม</h2>
        <div className="flex shrink-0 items-baseline gap-2.5 text-sm text-ink-faint">
          <button
            type="button"
            onClick={handleCopyForJira}
            disabled={entries.length === 0}
            className="transition enabled:hover:text-ink disabled:opacity-30"
            aria-label="คัดลอกเป็น bullet สำหรับ Jira"
            title="คัดลอกเป็น bullet สำหรับ Jira"
          >
            คัดลอก
          </button>
          <span>
            {done}/{entries.length}
          </span>
        </div>
      </div>
      <ul className="flex flex-col divide-y divide-line/50">
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
