import { isToday } from "../lib/date";

interface Props {
  activeDate: string;
  yesterdayPreview?: string | null;
}

export default function EmptyState({ activeDate, yesterdayPreview }: Props) {
  const today = isToday(activeDate);
  return (
    <div className="surface-muted animate-rise flex flex-col items-center justify-center rounded-2xl border-dashed px-6 py-14 text-center sm:px-8">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-brand-soft text-4xl">
        {today ? "🌤️" : "🗒️"}
      </div>
      <h3 className="font-display text-xl font-semibold text-ink">
        {today ? "เริ่มบันทึกวันนี้กันเลย" : "ยังไม่มีบันทึกของวันนี้"}
      </h3>
      <p className="mt-2 max-w-sm text-base text-ink-faint">
        {today
          ? "เพิ่มกิจกรรมด้านบน เลือกหมวดแล้วกด Enter — ระบบบันทึกให้อัตโนมัติ"
          : "เลือกวันอื่น หรือเพิ่มบันทึกย้อนหลังสำหรับวันนี้ได้เลย"}
      </p>
      {today && yesterdayPreview && (
        <p className="mt-5 max-w-md rounded-xl bg-paper-2/80 px-4 py-3.5 text-base text-ink-soft ring-1 ring-line">
          <span className="font-medium text-ink-faint">เมื่อวานคุณทำ: </span>
          {yesterdayPreview}
        </p>
      )}
    </div>
  );
}
