interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function FreeNote({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="section-label mb-2">บันทึกอิสระ</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="สรุปสั้นๆ เกี่ยวกับวันนี้…"
        rows={4}
        className="min-h-[100px] w-full resize-none rounded-xl border-0 bg-transparent p-0 text-base leading-relaxed text-ink outline-none transition placeholder:text-ink-faint focus:ring-0"
      />
    </div>
  );
}
