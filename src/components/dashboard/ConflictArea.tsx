import type { Conflict } from '../../models';

/**
 * Conflict area (MVP_SPEC §7) — only visible when conflicts exist.
 * Release 0.2: deadline-in-event conflicts.
 */
export function ConflictArea({ conflicts }: { conflicts: Conflict[] }) {
  if (conflicts.length === 0) return null;
  return (
    <section className="conflict-area" role="alert">
      <h3>⚠ Kritischer Planungskonflikt</h3>
      <ul>
        {conflicts.map((c) => (
          <li key={c.id}>{c.message}</li>
        ))}
      </ul>
    </section>
  );
}
