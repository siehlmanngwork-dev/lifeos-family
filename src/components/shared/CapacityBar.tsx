const SEGMENTS = 10;

interface CapacityBarProps {
  plannedMinutes: number;
  availableMinutes: number;
}

/** Visualisation "██████░░░░  6 von 10 Stunden verplant" (MVP_SPEC §7). */
export function CapacityBar({ plannedMinutes, availableMinutes }: CapacityBarProps) {
  const plannedHours = Math.round((plannedMinutes / 60) * 10) / 10;
  const availableHours = Math.round((availableMinutes / 60) * 10) / 10;
  const ratio = availableMinutes > 0 ? plannedMinutes / availableMinutes : plannedMinutes > 0 ? 1 : 0;
  const filled = Math.min(SEGMENTS, Math.round(ratio * SEGMENTS));
  const over = ratio > 1;

  return (
    <div className="capacity">
      <div className={`capacity-bar ${over ? 'over' : ''}`} aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={i < filled ? 'filled' : ''} />
        ))}
      </div>
      <p className="capacity-label">
        {plannedHours.toLocaleString('de-DE')} von {availableHours.toLocaleString('de-DE')} Stunden verplant
      </p>
    </div>
  );
}
