interface Props {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  /** On lg+, grow to fill leftover height in the day side panel. Mobile stays rows={4}. */
  fill?: boolean;
}

export default function FreeNote({ value, onChange, className, fill }: Props) {
  return (
    <div
      className={`${fill ? "lg:flex lg:min-h-[8.5rem] lg:flex-1 lg:flex-col lg:border-t lg:border-line/40 lg:pt-4" : ""} ${className ?? ""}`.trim()}
    >
      <h2 className="section-label mb-2 shrink-0">บันทึกอิสระ</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="สรุปสั้นๆ เกี่ยวกับวันนี้…"
        rows={4}
        className={`min-h-[100px] w-full resize-none rounded-xl border-0 bg-transparent p-0 text-base leading-relaxed text-ink outline-none transition placeholder:text-ink-faint focus:ring-0 ${
          fill ? "free-note-fill lg:min-h-0 lg:flex-1" : ""
        }`}
      />
    </div>
  );
}
