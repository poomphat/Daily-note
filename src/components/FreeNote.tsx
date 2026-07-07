interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function FreeNote({ value, onChange }: Props) {
  return (
    <div>
      <h2 className="mb-2 px-2 text-sm font-semibold text-ink-soft">
        บันทึกอิสระ / สรุปท้ายวัน
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="เขียนอะไรก็ได้เกี่ยวกับวันนี้… ความรู้สึก บทเรียน สิ่งที่อยากจำ ✍️"
        rows={4}
        className="w-full resize-none rounded-2xl border border-line bg-white/80 p-4 text-[15px] leading-relaxed text-ink shadow-sm outline-none ring-1 ring-black/[0.02] transition placeholder:text-ink-faint focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}
