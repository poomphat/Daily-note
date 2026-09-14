import { isToday } from "../lib/date";

interface Props {
  activeDate: string;
  yesterdayPreview?: string | null;
}

export default function EmptyState({ activeDate, yesterdayPreview }: Props) {
  const today = isToday(activeDate);
  return (
    <div className="animate-rise py-10 text-center sm:py-12">
      <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">
        {today ? "ยังไม่มีรายการวันนี้" : "ยังไม่มีบันทึกของวันนี้"}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-base text-ink-faint">
        {today
          ? "พิมพ์ด้านบนแล้วกด Enter — ระบบบันทึกให้อัตโนมัติ"
          : "เลือกวันอื่น หรือเพิ่มบันทึกย้อนหลังได้เลย"}
      </p>
      {today && yesterdayPreview && (
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-ink-soft">
          <span className="text-ink-faint">เมื่อวาน: </span>
          {yesterdayPreview}
        </p>
      )}
    </div>
  );
}
