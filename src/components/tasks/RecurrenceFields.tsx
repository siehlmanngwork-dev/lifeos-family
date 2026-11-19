import type { RecurrenceType, RecurrenceUnit, UserProfile } from '../../models';
import type { RecurrenceValue } from './recurrenceValue';
import { RECURRENCE_LABELS, RECURRENCE_UNIT_LABELS } from '../../services/recurrence/recurrenceEngine';

interface RecurrenceFieldsProps {
  value: RecurrenceValue;
  onChange: (value: RecurrenceValue) => void;
  members: UserProfile[];
  currentUserId: string;
  /** Rotation assigns other persons → requires `assignTasksToOthers` (DECISIONS D11). */
  canRotate: boolean;
}

/** Repetition settings for new tasks (RELEASE_0.2_SPEC §4). */
export function RecurrenceFields({ value, onChange, members, currentUserId, canRotate }: RecurrenceFieldsProps) {
  const set = (patch: Partial<RecurrenceValue>) => onChange({ ...value, ...patch });
  const toggleMember = (id: string) =>
    set({
      rotationMembers: value.rotationMembers.includes(id)
        ? value.rotationMembers.filter((m) => m !== id)
        : members.map((m) => m.id).filter((m) => m === id || value.rotationMembers.includes(m)),
    });

  return (
    <fieldset className="field">
      <legend>Wiederholung</legend>
      <select value={value.type} onChange={(e) => set({ type: e.target.value as RecurrenceValue['type'] })}>
        <option value="none">Keine</option>
        {(Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((t) => (
          <option key={t} value={t}>
            {RECURRENCE_LABELS[t]}
          </option>
        ))}
      </select>

      {value.type === 'custom' && (
        <div className="field-row">
          <label className="field">
            <span>Alle</span>
            <input
              type="number"
              min="1"
              step="1"
              value={value.interval}
              onChange={(e) => set({ interval: Math.max(1, Number(e.target.value) || 1) })}
            />
          </label>
          <label className="field">
            <span>Einheit</span>
            <select value={value.unit} onChange={(e) => set({ unit: e.target.value as RecurrenceUnit })}>
              {(Object.keys(RECURRENCE_UNIT_LABELS) as RecurrenceUnit[]).map((u) => (
                <option key={u} value={u}>
                  {RECURRENCE_UNIT_LABELS[u]}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {value.type !== 'none' && (
        <>
          <label className="field">
            <span>Anzahl Wiederholungen</span>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={value.count}
              onChange={(e) => set({ count: Math.min(100, Math.max(1, Number(e.target.value) || 1)) })}
            />
          </label>

          {canRotate && members.length > 1 && (
            <>
              <label className="checkbox">
                <input type="checkbox" checked={value.rotation} onChange={(e) => set({ rotation: e.target.checked })} />
                Rotierende Zuweisung
              </label>
              {value.rotation && (
                <div className="checkbox-list">
                  {members.map((m) => (
                    <label key={m.id} className="checkbox">
                      <input
                        type="checkbox"
                        checked={value.rotationMembers.includes(m.id)}
                        onChange={() => toggleMember(m.id)}
                      />
                      {m.id === currentUserId ? `${m.displayName} (ich)` : m.displayName}
                      {value.rotationMembers.includes(m.id) && (
                        <span className="muted"> · {value.rotationMembers.indexOf(m.id) + 1}.</span>
                      )}
                    </label>
                  ))}
                  <small className="muted">Reihenfolge wie aufgelistet; jede Wiederholung geht an die nächste Person.</small>
                </div>
              )}
            </>
          )}
        </>
      )}
    </fieldset>
  );
}
