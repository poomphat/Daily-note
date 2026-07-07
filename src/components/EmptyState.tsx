import { isToday } from "../lib/date";

interface Props {
  activeDate: string;
  yesterdayPreview?: string | null;
}

export default function EmptyState({ activeDate, yesterdayPreview }: Props) {
  const today = isToday(activeDate);
  return (
    <div className="animate-rise flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-elevated/40 px-6 py-12 text-center dark:bg-elevated/20">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-3xl">
        {today ? "🌤️" : "🗒️"}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">
        {today ? "เริ่มบันทึกวันนี้กันเลย" : "ยังไม่มีบันทึกของวันนี้"}
      </h3>
      <p className="mt-1 max-w-xs text-sm text-ink-faint">
        {today
          ? "เพิ่มกิจกรรมด้านบน เลือกหมวดแล้วกด Enter — ระบบบันทึกให้อัตโนมัติ"
          : "เลือกวันอื่น หรือเพิ่มบันทึกย้อนหลังสำหรับวันนี้ได้เลย"}
      </p>
      {today && yesterdayPreview && (
        <p className="mt-4 max-w-sm rounded-xl bg-paper-2/80 px-4 py-3 text-sm text-ink-soft ring-1 ring-line">
          <span className="font-medium text-ink-faint">เมื่อวานคุณทำ: </span>
          {yesterdayPreview}
        </p>
      )}
    </div>
  );
}
