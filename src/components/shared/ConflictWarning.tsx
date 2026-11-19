import type { Conflict } from '../../models';

/** Inline warning in forms. Never blocks saving (RELEASE_0.2_SPEC §5). */
export function ConflictWarning({ conflicts }: { conflicts: Conflict[] }) {
  if (conflicts.length === 0) return null;
  return (
    <div className="conflict-warning" role="status">
      <strong>⚠ Deadline fällt in bestehenden Termin.</strong>
      <ul>
        {conflicts.map((c) => (
          <li key={c.id}>{c.message}</li>
        ))}
      </ul>
    </div>
  );
}
