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
      <span className="shrink-0 text-sm leading-none transition-opacity duration-300" aria-hidden>
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
          className={`h-full rounded-full transition-[width,background-color] duration-500 ease-out ${BAR_CLASS[level.id]}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {/* Decorative echo of the progressbar's aria-label above — hidden from
          assistive tech to avoid announcing the same value twice. */}
      <span
        aria-hidden
        className={`shrink-0 text-xs font-semibold tabular-nums transition-colors duration-300 ${TEXT_CLASS[level.id]}`}
      >
        {score}%
      </span>
      <span
        aria-hidden
        className={`hidden shrink-0 text-xs font-medium transition-colors duration-300 sm:inline ${TEXT_CLASS[level.id]}`}
      >
        {level.label}
      </span>
    </div>
  );
}
