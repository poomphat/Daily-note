interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function FreeNote({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="mb-2.5 px-2 text-base font-semibold text-ink-soft">
        บันทึกอิสระ / สรุปท้ายวัน
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เขียนอะไรก็ได้เกี่ยวกับวันนี้… ความรู้สึก บทเรียน สิ่งที่อยากจำ ✍️"
        rows={5}
        className="surface surface-ring min-h-[120px] w-full resize-none rounded-2xl p-4 text-base leading-relaxed text-ink shadow-sm outline-none transition placeholder:text-ink-faint focus:ring-2 focus:ring-brand/30 sm:p-5"
      />
    </div>
  );
}
