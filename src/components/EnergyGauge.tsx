import { useMemo } from "react";
import { computeDayEnergy, type EnergyLevel } from "../lib/energy";
import type { DayNote } from "../lib/types";

interface Props {
  day: DayNote;
}

const BAR_CLASS: Record<EnergyLevel["id"], string> = {
  empty: "bg-ink-faint/30",
  warming: "bg-warning",
  flowing: "bg-brand",
  full: "bg-success",
};

const TEXT_CLASS: Record<EnergyLevel["id"], string> = {
  empty: "text-ink-faint",
  warming: "text-warning",
  flowing: "text-brand",
  full: "text-success",
};

/** Compact live gauge showing how much the active day has been journaled. */
export default function EnergyGauge({ day }: Props) {
  const energy = useMemo(() => computeDayEnergy(day), [day]);
  const { score, level } = energy;

  return (
    <div
      className="flex items-center gap-2"
      title={`พลังของวันนี้ ${score}% · ${level.label}`}
    >
      <span className="shrink-0 text-sm leading-none" aria-hidden>
        {level.emoji}
      </span>
      <div
        className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-paper-2"
        role="progressbar"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`พลังของวันนี้ ${score} เปอร์เซ็นต์ ระดับ${level.label}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${BAR_CLASS[level.id]}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`shrink-0 text-xs font-semibold tabular-nums ${TEXT_CLASS[level.id]}`}>
        {score}%
      </span>
      <span className={`hidden shrink-0 text-xs font-medium sm:inline ${TEXT_CLASS[level.id]}`}>
        {level.label}
      </span>
    </div>
  );
}
